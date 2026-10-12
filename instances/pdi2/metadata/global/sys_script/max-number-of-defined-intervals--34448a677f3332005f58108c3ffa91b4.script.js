(function executeRule(current, previous /*null when async*/) {

	var maxIntervals = gs.getProperty("glide.email.digest.max_intervals");
	var intervals = new GlideRecord('sys_email_digest_interval');
	intervals.query();

	// Restrict the number of intervals
	if (maxIntervals <= intervals.getRowCount()) {
		current.setAbortAction(true);
		var infoMessage = gs.getMessage("Too many email digest intervals have been generated and more cannot be created.");
		gs.addInfoMessage(infoMessage);
	}

})(current, previous);
