(function executeRule(current, previous /*null when async*/) {
	gs.addInfoMessage(gs.getMessage("Delete datasource index event created"));
	new sn_ais.IndexEvent().deleteTable(current.source);
})(current, previous);
