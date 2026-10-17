(function executeRule(current, previous /*null when async*/) {
	var dataItem = current.data_item;
	if (!dataItem)
		return;
	
	var dataItemTable = dataItem.table.toString();
	if (!dataItemTable)
		return;

	var table = current.table.toString();
	if (table != dataItemTable) {
		gs.addErrorMessage(gs.getMessage('Table field should have reference to the same table of data item'));
		current.setAbortAction(true);
	}
	
})(current, previous);
