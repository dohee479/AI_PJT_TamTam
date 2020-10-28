const app = require('./app')
const http = require('http')
const mongoose = require('mongoose')

const PORT = 3000

const MONGO_URL = "mongodb://localhost:27017/test"
const server = http.createServer(app)
server.listen(PORT)

server.on("listening", async () => {
	console.info(`Listening on port ${PORT}`)

	mongoose.connect(MONGO_URL, {
		useNewUrlParser: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
		useCreateIndex: true,
	})
	mongoose.connection.on("open", () => {
		console.info("Connection to Mongo")
	})
	mongoose.connection.on("error", (err) => {
		console.error(err)
	})
})