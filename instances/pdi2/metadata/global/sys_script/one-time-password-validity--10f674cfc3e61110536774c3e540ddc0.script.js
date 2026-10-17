(function executeRule(current, previous /*null when async*/) {
	if ( current.value < 3 || current.value > 10) {
		var property = current.name.toString();
		gs.addErrorMessage(gs.getMessage('Set a value between 3 and 10 both inclusive for {0}.', property));
		current.setAbortAction(true);
	}
})(current, previous);
