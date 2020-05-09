const https = require('https')
const options = {
  hostname: 'opendata.hopefully.works',
  port: 443,
  path: '/api/events',
  method: 'GET',
  headers: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjQsImVtYWlsIjoibWlrYWVsdGlra2FAaG90bWFpbC5jb20iLCJpYXQiOjE1ODkwNDE3MjB9.iTx07sGK84Zs05ZJOvoF4kDWEN2BLqesYw9jFRxGjkg'}
}
const { Pool } = require("pg")
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:JG7rx4RV@localhost:5432/postgres',
    ssl: process.env.DATABASE_URL ? true : false
})

var fs = require("fs")
var date = new Date()

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', data => {
    try {
      var dataObject = JSON.parse(data)
    } catch(err) {
      console.error(err)
    }
    var datum = new Date(Date.parse(dataObject.date))
    let timeStamp = datum.getTime()/1000;
    let JSONstring = ',\'"sensor1": "' +dataObject.sensor1
        +',"sensor2": "' + dataObject.sensor2
        +',"sensor3": "' + dataObject.sensor3
        +',"sensor4": "' + dataObject.sensor4 + '"}'
    console.log(dataObject.sensor2)
    pool.query(
    'INSERT INTO formatted(date, sensordata)VALUES('+timeStamp
        + JSONstring + '\')',
    (err, res) => {
      fs.writeFile('log ' + date.getTime(),'DB failure\nErr:\n' + err + '\nRes:\n'+ res, function (err){
        if(err) throw err;
      })
    pool.end();
    }
    )
  })
})

req.on('error', error => {
  fs.writeFile('log ' + date.getTime(),'GET failure: ' + error, function (err){
    if(err) throw err;
  })
})

req.end()