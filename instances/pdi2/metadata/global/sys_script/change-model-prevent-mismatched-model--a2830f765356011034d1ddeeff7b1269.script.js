(function executeRule(current, previous /*null when async*/) {

	var chgModel = current.chg_model.getRefRecord();
	var tableName = current.getTableName();
	if (chgModel.getValue("table_name") !== tableName) {
		gs.addErrorMessage(gs.getMessage("Change model '{0}' cannot be applied to records in the table {1}", [current.getDisplayValue("chg_model"), tableName]));
		current.setAbortAction(true);
	}
	
})(current, previous);
