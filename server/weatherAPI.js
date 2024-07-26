const axios = require('axios');
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';
const WEATHER_API_KEY = '2f085eb44d26b273142b9223af5441c4';

const GEO_API_OPTIONS = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': '2f085eb44d26b273142b9223af5441c4',
    'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
  },
};

 async function fetchWeatherData(lat, lon) {
  try {
    let [weatherPromise, forcastPromise] = await Promise.all([
      fetch(
        `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      ),
      fetch(
        `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      ),
    ]);

    const weatherResponse = await weatherPromise.json();
    
    console.log(weatherResponse);
  } catch (error) {
    console.log(error);
  }
}
const data = {};
const apikey = "dfbe68ba920041bc841101441242507"
async function FetchAPIdata(city) {
  var lat = 28.6667;
  var lon = 77.2167;
  
  var response;
  if( city == "Kolkata" ){
     lat = 22.5697;
     lon = 88.3697
  }
  if( city == "Bangalore" ){
    lat = 12.9762;
    lon = 77.6033;
 }
 if( city == "Chennai" ){
  lat = 13.0878; 
  lon = 80.2785;
}
if( city == "Mumbai" ){
  lat = 19.0144;
  lon = 72.8479;
}
if( city == "Hyderabad" ){
  lat = 17.3753;
  lon = 78.4744;
}

  try {
    let [weatherPromise] = await Promise.all([
      fetch(
        `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      ),
      fetch(
        `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      ),
    ]);

    const res = await weatherPromise.json();
    response = res;
    
  } catch (error) {
    console.log(error);
  }

  try {
    

    //console.log(weatherPromise)
    //console.log(response.wind.speed);
    data.Cloud = response.weather[0].main;
    data.Temp = response.main.temp;
    data.FeelsLike = response.main.feels_like;
    data.Wind = response.wind.speed;
    data.Pressure = response.main.pressure;
    data.Visibility = response.visibility;
    data.Gust = response.wind.gust;
    data.Location = response.name;
    data.Longitude = lat;
    data.Latitude = lon;
    data.WindDeg = response.wind.deg;
    data.Localtime = response.timezone;
    data.Humidity = response.main.humidity;





    return data
  } catch (error) {
    console.error(error);
  }
}

// (async () => {
//   let a = await FetchAPIdata('New York, Canada');
//   console.log('hi', a);
// })();

module.exports = { FetchAPIdata };
