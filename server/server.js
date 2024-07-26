const express = require('express');
const app = express();
const port = 5100;
const cors = require('cors');

const { LoginCred } = require('./login');
const { RegisterCred } = require('./register');
const { ActiveUsers } = require('./dashboard');
const { ActiveUserDetails } = require('./activeUser');
const { FetchAPIdata } = require('./weatherAPI')

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://dev-new-id:hellodev@webdevelopment.cupcivg.mongodb.net/?appName=WebDevelopment";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

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
  const { Username, Password, Name, City } = req.body;
  const result = await RegisterCred(Username, Password, Name, City);

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
  const WeatherData = await FetchAPIdata(result.City);

  finData = {result, WeatherData}

  console.log('sending this data to frontend')
  console.log(result)

  res.send(finData);

})

app.post('/changelocation', async (req, res) => {
  const a = req.body;
  console.log(a.loc);
  const newloc = a.loc;
  const result = await ActiveUserDetails();
  const WeatherData = await FetchAPIdata(newloc);

  finData = {result, WeatherData}

  console.log('sending this data to frontend')
  console.log(result)

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

app.listen(port, () => {
  console.log("server started")
});

