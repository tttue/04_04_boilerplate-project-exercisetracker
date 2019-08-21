const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(process.cwd(), 'private.env') });
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

const checkDate = require("./tool").checkDate;
const checkNumber = require("./tool").checkNumber;

var userSchema = new mongoose.Schema({
	id: Number,
	name: String
});
userSchema.index({ id: -1 });
userSchema.index({ name: 1 });
var User = mongoose.model('User', userSchema);

var exerciseSchema = new mongoose.Schema({
	userId: Number,
	description: String,
	duration: Number,
	date: Date
});
exerciseSchema.index({ userId: 1 });
exerciseSchema.index({ date: 1 });
var Exercise = mongoose.model('Exercise', exerciseSchema);

var createUser = (name, done) => {
	if (!name) {
		done(null, {
			errorCode: -1,
			errorMsg: "Username is not blank"
		});
	} else {
		findUserByName(name, (err, data) => {
			if (err) {
				done(err);
			} else if (data) {
				console.log("User", name, "exists.")
				done(null, {
					errorCode: -1,
					errorMsg: "User " + name + " exists.",
					data: {
						username: data.name,
						id: data.id
					}
				}
				);
			} else {
				User.findOne()
					.sort({ id: -1 })
					.limit(1)
					.exec((err, data) => {
						if (err) {
							done(err);
						} else {
							console.log("User", name, "is creating.")
							let nextId = 1;
							if (data) {
								nextId = data.id + 1;
							}
							let objUser = {
								id: nextId,
								name: name
							}
							let user = new User(objUser);
							user.save((err, data) => err ? done(err) : done(null, { errorCode: 0, data: { username: data.name, id: data.id } }));
						}
					});
			}
		})
	}
};

var createExercise = (inputData, done) => {
	var checkResult = checkNumber(inputData.userId, "userId", true);
	if (checkResult) {
		done(null, { errorCode: -2, errorMsg: checkResult });
		return;
	}
	checkResult = checkNumber(inputData.duration, "duration", true);
	if (checkResult) {
		done(null, { errorCode: -2, errorMsg: checkResult });
		return;
	}
	checkResult = checkDate(inputData.date, "date");
	if (checkResult) {
		done(null, { errorCode: -2, errorMsg: checkResult });
		return;
	}
	if (!inputData.description) {
		done(null, { errorCode: -2, errorMsg: "description is not blank" });
		return;
	}

	findUserById(inputData.userId, (err, dataUser) => {
		if (err) {
			done(err);
		} else if (!dataUser) {
			done(err, { errorCode: -1, errorMsg: "User is not found" });
		} else {
			let objExer = {
				userId: parseInt(inputData.userId),
				description: inputData.description,
				duration: parseInt(inputData.duration),
			}
			if (inputData.date) {
				objExer.date = new Date(inputData.date);
			} else {
				objExer.date = new Date();
			}
			let exercise = new Exercise(objExer);
			exercise.save((err, dataExer) => {
				if (err) {
					done(err);
				} else {
					// {"username":"tttue1","description":"1","duration":2440,"_id":"HJorbUcEH","date":"Thu Jan 01 1970"}
					done(null, {
						errorCode: 0,
						data: {
							username: dataUser.name,
							description: dataExer.description,
							duration: dataExer.duration,
							userId: dataExer.userId,
							date: dataExer.date,
							id: dataExer._id
						}
					});
				}
			})
		}
	});
}

var findExercise = (inputData, done) => {
	var checkResult = checkNumber(inputData.userId, "userId", true);
	if (checkResult) {
		done(null, { errorCode: -2, errorMsg: checkResult });
		return;
	}
	checkResult = checkNumber(inputData.limit, "limit", false);
	if (checkResult) {
		done(null, { errorCode: -2, errorMsg: checkResult });
		return;
	}
	checkResult = checkDate(inputData.from, "from");
	if (checkResult) {
		done(null, { errorCode: -2, errorMsg: checkResult });
		return;
	}
	checkResult = checkDate(inputData.to, "to");
	if (checkResult) {
		done(null, { errorCode: -2, errorMsg: checkResult });
		return;
	}
	var query = { userId: inputData.userId };
	if (inputData.from && inputData.to) {
		query.date = {
			$gte: new Date(inputData.from),
			$lte: new Date(inputData.to)
		};
	} else if (inputData.from) {
		query.date = {
			$gte: new Date(inputData.from)
		};
	} else if (inputData.to) {
		query.date = {
			$lte: new Date(inputData.to)
		};
	}
	let limit = 100
	if (inputData.limit) {
		limit = parseInt(inputData.limit);
	}
	findUserById(inputData.userId, (err, dataUser) => {
		if (err) {
			done(err);
		} else if (!dataUser) {
			done(err, { errorCode: -1, errorMsg: "User is not found" });
		} else {
			Exercise.find(query).limit(limit).exec((err, data) => {
				if (err) {
					done(err);
				} else {
					done(null, {
						userId: dataUser.id,
						username: dataUser.name,
						count: data.length,
						log: data
					});
				}
			});//Exercise.find
		}
	});//findUserById
}

var findUserByName = (name, done) => {
	User.findOne({ name: name }, (err, data) => err ? done(err) : done(null, data));
}

var findUserById = (id, done) => {
	User.findOne({ id: id }, (err, data) => err ? done(err) : done(null, data));
}
exports.UserModel = User;
exports.ExerciseModel = Exercise;
exports.createUser = createUser;
exports.createExercise = createExercise;
exports.findExercise = findExercise;