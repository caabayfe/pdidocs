(function executeRule(current, previous /*null when async*/) {
	var curValue = parseInt(current.value);
	var prevValue = parseInt(previous.value);
	
	// Add your code here
	if (curValue < prevValue)
		gs.eventQueue("pwd.credStore.history.limit.decrease", current, prevValue, curValue);

})(current, previous);
