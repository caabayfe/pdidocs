(function executeRule(current, previous /*null when async*/) {
	
	//Caution: when updating this script be sure to update also 'Validate copy group regex string' client script

	if (current.mapping_type != "6") 
		return;
	
	var regexStr = current.copy_group_regex;
	
	try {
		/*
			Execute regexStr + '|' with an empty string to find capturing groups.
			In case of a valid regex, there will always be one matching group which is the whole string.
			So, we substract 1 to get the group count in original expression string.
		*/
		var nCapturingGroups = new RegExp(regexStr + '|').exec('').length - 1;
		
		// The expression should have EXACTLY ONE matching group to be mapped to to_field
		if (nCapturingGroups !== 1) {
			gs.addErrorMessage(gs.getMessage("'Copy group regex' should include exactly one group"));
			current.setAbortAction(true);
			return;
		}
	} catch (e) {
		gs.addErrorMessage(gs.getMessage("The value of 'Copy group regex' is not a valid regular expression"));
		// Prevent submission
		current.setAbortAction(true);
		return;
	}
})(current, previous);
