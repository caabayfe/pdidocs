function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
    var saveAndClose = true;
    if (!isJson(newValue)) {
        alert("Payload must be formatted as JSON array of string values, e.g. [\"term1\",\"term2\"]");

        //Abort the submission
        saveAndClose = false;
    }

    callback(saveAndClose);
}

function isJson(str) {
    var isValid = false;
    try {
        var parsed = JSON.parse(str);
        if (!Array.isArray(parsed))
            return isValid;
        // Make sure every entry is a string 
        var arrayLength = parsed.length;
        for (var i = 0; i < arrayLength; i++) {
            if (typeof parsed[i] != "string") {
                return isValid;
            }
        }
		isValid = true;
    } catch (err) {
		// default is false
    }
	return isValid;
}
