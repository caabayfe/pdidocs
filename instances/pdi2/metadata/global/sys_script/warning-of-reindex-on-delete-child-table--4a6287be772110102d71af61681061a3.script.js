(function executeRule(current, previous /*null when async*/) {
	var warnReindex = gs.getMessage("Reindex datasource needed to delete child table from index");
	if (!gs.getInfoMessages().contains(warnReindex))
		gs.addInfoMessage(warnReindex);
})(current, previous);
