(function executeRule(current, previous /*null when async*/) {
	var intGr = current.interaction.getRefRecord();
	intGr.help_requested = true;
	intGr.update();
})(current, previous);
