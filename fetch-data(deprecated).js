let request = require('request')
const { Pool } = require("pg")
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:JG7rx4RV@localhost:5432/postgres',
  ssl: process.env.DATABASE_URL ? true : false
})
/*
function getToken() {
  return new Promise(function(resolve,reject){
    const options = {
      uri: 'https://opendata.hopefully.works/api/login',
      method: 'POST',
      json: {
        "email": "mikaeltikka@hotmail.com",
        "password": "JG7rx4RV"
      },
      headers: {
        "content-type": "application/json"
      }
    }
    request(options, function (error, response, body) {
      if (error) return reject(error)
      if (!error && response.statusCode == 200) {
        resolve(body.accessToken)
      }
    }
    )
  })
}*/

async function getJSON(){
  let token = new Promise(function(resolve,reject){
    const options = {
      uri: 'https://opendata.hopefully.works/api/login',
      method: 'POST',
      json: {
        "email": "mikaeltikka@hotmail.com",
        "password": "JG7rx4RV"
      },
      headers: {
        "content-type": "application/json"
      }
    }
    request(options, function (error, response, body) {
          if (error) return reject(error)
          if (!error && response.statusCode == 200) {
            resolve(body.accessToken)
          }
        }
    )
  })
  let accessToken
  try {
    accessToken = await token
  } catch(error){
    console.log('Promise rejected: ' + error)
  }
  console.log("AccessToken: " + accessToken)
  let dataObject = []
  try {
    const options = {
      uri: 'https://opendata.hopefully.works/api/events',
      method: 'GET',
      headers: {'Authorization': 'Bearer ' + accessToken + ''}
    }
    request(options, function (error, response, body) {
      console.log(response.statusCode)
      if (error) {
        console.log(error);
        return;
      }
      if (!error && response.statusCode == 200) {
        try {
          dataObject = JSON.parse(body)
          console.log(body + "\nparsed to:\n" + dataObject)
        } catch (err) {
          console.error(err)
        }
      }
    })
  } catch (error){
    console.error(error);
  }
  return dataObject
}

function main(){
  const dataObject = getJSON()
  console.log('main dataObject: ' + dataObject)
  const datum = new Date(Date.parse(dataObject.date))
  const timeStamp = datum.getTime() / 1000;
  const JSONstring = ',\'"sensor1": "' + dataObject.sensor1
      + ',"sensor2": "' + dataObject.sensor2
      + ',"sensor3": "' + dataObject.sensor3
      + ',"sensor4": "' + dataObject.sensor4 + '"}'
  pool.query(
      'INSERT INTO formatted(date, sensordata)VALUES(' + timeStamp
      + JSONstring + '\')',
      (err, res) => {
        console.log(err, res)
        pool.end();
      }
  )
}

main();