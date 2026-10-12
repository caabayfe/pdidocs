(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var pattern = current.pattern.toString();
	current.pattern = decodeURI(pattern).replace(/^'(.*)'$/, '$1');

})(current, previous);
