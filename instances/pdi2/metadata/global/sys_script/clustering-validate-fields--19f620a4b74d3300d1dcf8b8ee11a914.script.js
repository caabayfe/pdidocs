(function executeRule(current, previous /*null when async*/) {
	var min_records = parseInt(current.min_records);
	var threshold = parseInt(current.threshold);
	var outputErrorMessage = '';
	if (isNaN(min_records) || (min_records < 2)){
		outputErrorMessage = gs.getMessage('Minimum number of records in a cluster should be an integer greater than or equal to 2');
		gs.addErrorMessage(outputErrorMessage);
		return false;
	} else if (isNaN(threshold) || threshold < 0 || threshold > 100) {
		outputErrorMessage = gs.getMessage('Target Solution Coverage should be between 0 to 100');
		gs.addErrorMessage(outputErrorMessage);
		return false;
	}
	
	return true;
})(current, previous);
