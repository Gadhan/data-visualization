const https = require('https')
const options = {
  hostname: 'https://opendata.hopefully.works',
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

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', d => {
    pool.query(
    "INSERT INTO data(json)VALUES(d)",
    (err, res) => {
    console.log(err, res);
    pool.end();
    }
    )
  })
})

req.on('error', error => {
  console.error(error)
})

req.end()