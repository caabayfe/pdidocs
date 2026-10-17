(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var propVal = current.value;
	var cleanPropVal = propVal.trim().replace(/\r?\n/g, ",");
	current.value = cleanPropVal;
	current.description = "List of trusted origins we allow to propagate messages (sent via window.postMessage) in the UI. Origins must be separated by a comma, line breaks can negatively affect page rendering.";

})(current, previous);
