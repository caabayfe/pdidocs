(function executeRule(current, previous /*null when async*/) {
	
	var baseTable = new TableUtils(current.tablename).getAbsoluteBase();
	var message = "A record with a matching sys_id is found on the base table "+baseTable+". Attempting to undelete this record will fail. First, delete the record on "+baseTable+" then Undelete this record.";

	var gr = new GlideRecord(baseTable);
	if (gr.get(current.documentkey)) {
		gs.addWarningMessage(message);
	}

})(current, previous);
