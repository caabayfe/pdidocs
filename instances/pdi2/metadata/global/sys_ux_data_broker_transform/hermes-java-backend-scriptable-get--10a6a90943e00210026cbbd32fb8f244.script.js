function transform(input) {
    var resultFromServer = "";
	var results = {
        returnValue: "",
        errors: []
    };
    try {
        resultFromServer = new sn_hermes[input.scriptableClassName]()[input.methodName](JSON.stringify(input.args));
    } catch (ex) {
        results.errors.push(ex);
    }
    results.returnValue = resultFromServer;
    return results;
}
