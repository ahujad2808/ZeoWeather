const express = require('express');
const app = express();
const port = 5100;
const cors = require('cors');
const nodemailer = require("nodemailer");
const { LoginCred } = require('./login');
const { RegisterCred } = require('./register');
const { ActiveUsers } = require('./dashboard');
const { ActiveUserDetails } = require('./activeUser');
const { FetchAPIdata } = require('./weatherAPI')
const cron = require('node-cron');

app.use(cors());
var flag = false;
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://dev-new-id:hellodev@webdevelopment.cupcivg.mongodb.net/?appName=WebDevelopment";






const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "ahujad2808@gmail.com",
    pass: "rgkm hdfy usrb qlrj",
  },
});


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function alertuser(email){

  const mailOptions = {
    from: "ahujad2808@gmail.com",
    to: email,
    subject: "Temperature Exceeded",
    text: "This is a warning that the temperature has exceeded above the specified threshold",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });

}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

app.post('/loginCredentials', async (req, res) => {
  const { Username, Password } = req.body;
  const result = await LoginCred(Username, Password);

  if (result === 1) {
    res.send('successful')
  } else {
    res.send('unsuccessful')
  }
  
});

app.post('/registerCredentials', async (req, res) => {
  const { Username, Password, Name, City, Alert } = req.body;
  const result = await RegisterCred(Username, Password, Name, City, Alert);

  if (result === 1) {
    res.send('exists')
  } else if (result === 2) {
    res.send('created')

  }
  else if (result === 0) {
    res.send('unsuccessful')
  }

});

app.get('/loadDashboard', async (req, res) => {
  const result = await ActiveUserDetails();
  // console.log(result);
  
  
  const  WeatherData = await FetchAPIdata(result.City);
  
  if( flag == false && WeatherData.Temp > result[0].AlertT ){
    alertuser(result[0].Username)
       flag = true;
   }

  finData = {result, WeatherData}
  
  // console.log('sending this data to frontend')
  // console.log(result)

  res.send(finData);

})

app.post('/changelocation', async (req, res) => {
  const a = req.body;
  // console.log(a.loc);
  const newloc = a.loc;
  const result = await ActiveUserDetails();
  const WeatherData = await FetchAPIdata(newloc);

  finData = {result, WeatherData}

  if( flag == false && WeatherData.Temp > result[0].AlertT ){
    alertuser(result[0].Username)
       flag = true;
   }

  // console.log('sending this data to frontend')
  // console.log(result[0].AlertT)

  res.send(finData);
  // const result = await ActiveUsers(Username, Password)
  // if (result == 1) {
  //   res.send('added')
  // } else {
  //   res.send('not added')
  // }

})

app.post('/activeUsers', async (req, res) => {
  const { Username, Password } = req.body;

  const result = await ActiveUsers(Username, Password)
  if (result == 1) {
    res.send('added')
  } else {
    res.send('not added')
  }

})

async function SWW(username, weatherData) {
  await client.connect();
  const db = client.db('WeatherSenseDB');
  const col = db.collection('HourlyWeatherData');
  
  const data = {
    'username': username,
    'temperature': weatherData.Temp,
    'condition': weatherData.Cloud,
    'timestamp': new Date()
  };
  await col.insertOne(data);
  
}

cron.schedule('0 0 */1 * * *', async () => {
  
  const activeUsers = await ActiveUserDetails();
  for (let user of activeUsers) {
    const weatherData = await FetchAPIdata(user.City);
    
    await SWW(user.Username, weatherData);
  }
});


cron.schedule('0 0 0 * * *', async () => {
  await client.connect();
  // console.log('Calculating daily aggregates');
  const db = client.db('WeatherSenseDB');
  const hourlyCollection = db.collection('HourlyWeatherData');
  const dailyCollection = db.collection('DailyWeatherData');
  
  const activeUsers = await ActiveUserDetails();
  for (let user of activeUsers) {
    const userWeatherData = await hourlyCollection.find({
      username: user.Username,
      timestamp: { 
        $gte: new Date(new Date().setHours(0, 0, 0, 0)), 
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    }).toArray();
    
    const temperatures = userWeatherData.map(data => data.temperature);
    const conditions = userWeatherData.map(data => data.condition);

    const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const maxTemp = Math.max(...temperatures);
    const minTemp = Math.min(...temperatures);
    const dominantCondition = conditions.sort((a, b) =>
      conditions.filter(v => v === a).length - conditions.filter(v => v === b).length
    ).pop();

    const dailySummary = {
      username: user.Username,
      date: new Date(new Date().setHours(0, 0, 0, 0)),
      avgTemp: avgTemp,
      maxTemp: maxTemp,
      minTemp: minTemp,
      dominantCondition: dominantCondition
    };

    await dailyCollection.insertOne(dailySummary);
  }

  await hourlyCollection.deleteMany({
    timestamp: { 
      $lt: new Date(new Date().setHours(0, 0, 0, 0))
    }
  });
});

app.listen(port, () => {
  console.log("server started")
});

