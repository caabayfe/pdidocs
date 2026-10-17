(function executeRule(current, previous /*null when async*/) {
	var uniqueError = gs.getMessage("A Code Search Table entry for this Table already exists. You may only have one entry per table, per Search Group.");

	//Only allow one entry for a given table within a Search Group
	var sgt = new GlideRecord("sn_codesearch_table");
	sgt.addQuery("table", current.getValue("table"));
	sgt.addQuery("search_group", current.getValue("search_group"));
	sgt.addQuery("sys_id", "!=", current.getValue("sys_id"));
	sgt.query();
	
	if(sgt.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(uniqueError);
	}
	
})(current, previous);
