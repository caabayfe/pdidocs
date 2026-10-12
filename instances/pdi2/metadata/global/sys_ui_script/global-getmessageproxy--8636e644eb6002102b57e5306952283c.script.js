function getMessage(message, callback) {
    var result;
	if(message) {
		result = gs.getMessage(message);
		if (typeof callback == "function") {
			callback(result);
		}
	}
    return result;
}

csGlobals['getMessage'] = getMessage;
