/*
	npm install express body-parser mongodb mongoose cors shortid dotenv
*/

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

var timeout = 10000;
app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/views/index.html')
});


// Create new user
const createUser = require("./database_tool").createUser;
app.post("/api/exercise/new-user", function (req, res, next) {
	var t = setTimeout(() => { next({ message: 'timeout' }) }, timeout);
	let username = req.body.username;
	console.log(req.body);
	createUser(username, (err, info) => {
		clearTimeout(t);
		err ? next(err) : res.json(info);
	});
});

// Add exercise
const createExercise = require("./database_tool").createExercise;
app.post("/api/exercise/add", function (req, res, next) {
	var t = setTimeout(() => { next({ message: 'timeout' }) }, timeout);
	console.log(req.body);
	createExercise(req.body, (err, info) => {
		clearTimeout(t);
		err ? next(err) : res.json(info);
	})
});

// Find exercise
const findExercise = require("./database_tool").findExercise;
app.get("/api/exercise/log", function (req, res, next) {
	var t = setTimeout(() => { next({ message: 'timeout' }) }, timeout);
	console.log(req.query);
	findExercise(req.query, (err, info) => {
		clearTimeout(t);
		err ? next(err) : res.json(info);
	})
});

// Not found middleware
app.use((req, res, next) => {
	return next({ status: 404, message: 'not found' })
})

// Error Handling middleware
app.use((err, req, res, next) => {
	let errCode, errMessage

	if (err.errors) {
		// mongoose validation error
		errCode = 400 // bad request
		const keys = Object.keys(err.errors)
		// report the first validation error
		errMessage = err.errors[keys[0]].message
	} else {
		// generic or custom error
		errCode = err.status || 500
		errMessage = err.message || 'Internal Server Error'
	}
	res.status(errCode).type('txt')
		.send(errMessage)
})


const listener = app.listen(process.env.PORT || 3000, () => {
	console.log('Your app is listening on port ' + listener.address().port)
})