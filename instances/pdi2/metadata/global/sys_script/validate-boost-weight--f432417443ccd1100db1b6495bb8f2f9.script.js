(function executeRule(current, previous /*null when async*/) {
	var integerMax = 2147483647;
	var integerMin = -2147483648;
	
	var tempBoostNumber = parseInt(current.boost_number.replace(/,/g, ''), 10);
	
	if(tempBoostNumber > integerMax || tempBoostNumber < integerMin) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Please provide a valid number for {0}. The maximum value is {1}. The minimum value is {2}",[current.boost_number.getLabel(), integerMax, integerMin]));	
	}
})(current, previous);
