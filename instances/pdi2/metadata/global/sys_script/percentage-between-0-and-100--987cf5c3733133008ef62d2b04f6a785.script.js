(function executeRule(current, previous /*null when async*/) {
	var percentage = current.getValue("percentage");
	percentage = parseFloat(percentage);
	if (isNaN(percentage) || percentage < 0)
		current.setValue("percentage", 0);
	if (percentage > 100)
		current.setValue("percentage", 100);
})(current, previous);
