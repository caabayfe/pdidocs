(function executeRule(current, previous /*null when async*/ ) {
	var max_elapsed_time = current.max_elapsed_time;
	var property = new GlideRecord('sys_properties');
	property.addQuery('name', 'glide.fdih.retry.max_time_in_seconds');
	property.query();
	if (property.hasNext()) {
		property.next();
		var value = property.getValue('value');
		if (max_elapsed_time > value) {
			gs.addErrorMessage(gs.getMessage("Max Elapsed Time value should not exceed {0} seconds", value));
			current.setAbortAction(true);
		}
	} else if (max_elapsed_time > 86400) { //check for deafult 1 day max value
		gs.addErrorMessage(gs.getMessage("Max Elapsed Time value should not exceed {0} seconds", "86400"));
		current.setAbortAction(true);
	}
})(current, previous);
