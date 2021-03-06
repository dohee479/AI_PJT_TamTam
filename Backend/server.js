const app = require('./app')
const http = require('http')
const mongoose = require('mongoose')

const PORT = 3000

const MONGO_URL = 'mongodb://k3b203.p.ssafy.io:5000/tamtam'
const server = http.createServer(app)
server.listen(PORT)
server.on('listening', async () => {
  mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  mongoose.connection.on('error', (err) => {
    console.error(err)
  })
})
