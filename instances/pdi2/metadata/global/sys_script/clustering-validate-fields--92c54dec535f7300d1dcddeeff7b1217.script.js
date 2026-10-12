(function executeRule(current, previous /*null when async*/) {
	var min_records = parseInt(current.min_records);
	var outputErrorMessage = '';
	if (isNaN(min_records) || (min_records < 2)){
		outputErrorMessage = gs.getMessage('Minimum number of records in a cluster should be an integer greater than or equal to 2');
		gs.addErrorMessage(outputErrorMessage);
		current.setAbortAction(true);
	}
})(current, previous);
