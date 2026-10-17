function onSubmit() {
    if (g_form.isMandatory("payload") && !isJson(g_form.getValue("payload"))) {
        g_form.addErrorMessage(getMessage("Payload must be formatted as JSON array of string values, e.g. [\"term1\",\"term2\"]"));

        //Make sure dirty form still works
        g_form.submitted = false;

        //Abort the submission
        return false;
    }
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
