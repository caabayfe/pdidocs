(function executeRule(current, previous /*null when async*/) {
	var value = parseInt(current.value);
	var type = current.type + '';
	
	function isValidRange(val) {
		return (val >= 30 && val <= 1800);
	}
	
	function isTurnedOff(val) {
		return val === 0;
	}
	
	function isValidValue(val) {
		return isValidRange(val) || isTurnedOff(val);
	}
	
	if (!isValidValue(value) || type !== 'integer') {
		gs.addErrorMessage(gs.getMessage('The uxr_session_ping property must be of type integer with a value of 0 or fall within the range of 30 - 1800'));
		current.setAbortAction(true);		
	}

})(current, previous);
