
function checkNumber(data, name = "Param", isNotBlank = false) {
	let checkNumberS = /^[0-9]*$/;

	if (!data && isNotBlank) {
		return name + " must be not blank"
	} else if (!data) {
		return null;
	} else if (!checkNumberS.test(data)) {
		return name + ": wrong number format";
	}
	return null;
}

function checkDate(data, name = "Param", isNotBlank = false) {
	let checkDateS = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

	if (!data && isNotBlank) {
		return name + " must be not blank"
	} else if (!data) {
		return null;
	} else if (!checkDateS.test(data)) {
		return name + ": wrong date format";
	} else if (isNaN((new Date(data)).getTime())) {
		return name + ": Invalid Date";
	}

	return null;
}

exports.checkDate = checkDate;
exports.checkNumber = checkNumber;