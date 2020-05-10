const https = require('https')

const options = {
  hostname: 'opendata.hopefully.works',
  port: 443,
  path: '/api/events',
  method: 'GET',
  headers: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjQsImVtYWlsIjoibWlrYWVsdGlra2FAaG90bWFpbC5jb20iLCJpYXQiOjE1ODkxMjUzMDZ9.H7M4ZCFdRT6NACl5sR4-Bv_C_aNFrXsvZhoqK8D1_M0'}
}
const { Pool } = require("pg")
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:JG7rx4RV@localhost:5432/postgres',
    ssl: process.env.DATABASE_URL ? true : false
})

req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', data => {
    try {
      var dataObject = JSON.parse(data)
    } catch(err) {
      console.error(err)
    }
    const realdate = new Date().toString()
    pool.query(
    'INSERT INTO data(actualdate, date, sensor1, sensor2, sensor3, sensor4)VALUES(\''+ realdate
        + '\', \'' + dataObject.date
        + '\', \'' + dataObject.sensor1
        + '\', \'' + dataObject.sensor2
        + '\', \'' + dataObject.sensor3
        + '\', \'' + dataObject.sensor4
        + '\')',
    (err, res) => {
      console.log(err, res)
    pool.end();
    }
    )
  })
})

req.on('error', error => {
  console.log(error)
})

req.end()