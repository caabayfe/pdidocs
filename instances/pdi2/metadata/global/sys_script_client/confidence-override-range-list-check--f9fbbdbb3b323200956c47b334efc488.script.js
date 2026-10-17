function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
	var saveAndClose = true;
	var confidenceVal = parseInt(newValue);
	
	if (isNaN(confidenceVal) || confidenceVal < 0 || confidenceVal > 100) {
		g_form.addErrorMessage(getMessage('Override must be an integer between 0 and 100'));
		saveAndClose = false;
	}
	
	callback(saveAndClose); 
}
