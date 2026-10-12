(function executeRule(current, previous /*null when async*/) {

	var errors = new StdChangeTaskUtils().createTaskTemplatesFromChange(current, current.getValue("created_from_change"));
	
	if (errors && errors.length > 0) {
		for (var i = 0; i < errors.length; i++)
			gs.addInfoMessage(errors[i]);
	}

})(current, previous);
