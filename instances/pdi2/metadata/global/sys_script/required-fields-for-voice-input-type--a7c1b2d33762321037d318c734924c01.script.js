(function executeRule(current, previous /*null when async*/) {

	if (gs.nil(current.input_format_description) || gs.nil(current.input_format_example)) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Cannot save the record. Input Format Description and Input Format Example are required when Input Type is Voice.'));
	}

})(current, previous);
