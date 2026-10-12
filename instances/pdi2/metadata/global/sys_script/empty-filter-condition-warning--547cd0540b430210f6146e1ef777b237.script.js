(function executeRule(current, previous /*null when async*/) {
	if (current.isActionAborted())
		return;

	// add info message only after the data filter has been inserted (see when to run section)
	gs.addInfoMessage(gs.getMessage('Data filters with empty filter conditions never change database queries, and may override parent data filters that secured this table.'));

})(current, previous);
