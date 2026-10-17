function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
	var saveAndClose = true;
	if (newValue === '10' || newValue === '1') {
		var validateData = new GlideAjax('AssetUtilsAJAX');
		validateData.addParam('sysparm_name', 'validateConsumables');
		validateData.addParam('sysparm_ids', sysIDs);
		validateData.addParam('sysparm_state', newValue);
		validateData.getXMLWait();
		if (validateData.getAnswer() === 'false') {
			saveAndClose = false;
		}
	}
	callback(saveAndClose);
}
