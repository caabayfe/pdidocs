(function executeRule(current, previous /*null when async*/) {
	var table = current.table;
	if (new global.GlobalServiceCatalogUtil().isCatItemTable(table)) {
		gs.addErrorMessage(gs.getMessage("Catalog Item can't be added as List Filter"));
		current.setAbortAction(true);
	}

})(current, previous);
