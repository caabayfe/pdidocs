(function executeRule(current, previous /*null when async*/) {

	if (SNC.MultiSourceScriptableApi.hasDataForMappedColumn(current.sys_id)) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Multisource data exists for the mapping. Please clear the data before deleting.'));

	}

})(current, previous);
