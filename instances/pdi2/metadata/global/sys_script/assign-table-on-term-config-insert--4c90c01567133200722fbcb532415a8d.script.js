(function executeRule(current, previous /*null when async*/) {
	var isAssigned = new SNC.GlideTermTableAPI().assignTermTableName(current);
	if (isAssigned) {
		gs.addInfoMessage(gs.getMessage("Assigned term table: {0}",current.term_table_name));
	} else {
		gs.addErrorMessage(gs.getMessage("Term table could not be assigned"));
	}
})(current, previous);
