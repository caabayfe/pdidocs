function onBefore(current, previous) {
	var qbsManager = new SNC.QueryBasedServiceManager();
	var tableName = current.getValue('table');
	var errorMsg = qbsManager.verifyTable(tableName);
	if (errorMsg.length > 0) {
		gs.addErrorMessage(errorMsg);
		current.setAbortAction(true);
	}
}
