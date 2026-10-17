(function executeRule(current, previous /*null when async*/) {
	var midName = current.name.replace(/(<([^>]+)>)/gi, "");
	current.name = midName;
})(current, previous);
