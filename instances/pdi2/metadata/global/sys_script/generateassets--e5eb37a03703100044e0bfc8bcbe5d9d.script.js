// Function to validate inputs
function validateInputs(sysId, cmdbCiClass) {
	var isValid = true;

	// Validate sys_id
	var modelCategoryQr = new GlideRecord('cmdb_model_category');
	modelCategoryQr.addQuery('sys_id', sysId);
	modelCategoryQr.query();
	if (!modelCategoryQr.hasNext()) {
		gs.addErrorMessage(gs.getEscapedMessage('The provided Sys ID {0} is invalid. Provide a valid Sys ID to pass the validation.', sysId));
		isValid = false;
	}

	// Validate cmdb_ci_class
	var tableUtil = new TableUtils(cmdbCiClass);
	var baseClass = tableUtil.getAbsoluteBase();
	if (!baseClass.equals('cmdb_ci')) {
		gs.addErrorMessage(gs.getEscapedMessage('The provided CI class {0} is invalid. Provide a valid CI class to pass the validation.', cmdbCiClass));
		isValid = false;
	}

	return isValid; // Return true if both validations pass, otherwise false
}

// Prepare and execute the job
function executeJob() {
	var currentSysId = current.sys_id;
	var currentCmdbCiClass = current.cmdb_ci_class;
	if (!validateInputs(currentSysId, currentCmdbCiClass)) {
		current.setAbortAction(true);
		return;
	}

	var script;
	if (gs.getProperty(AssetandCI.ASSET_ASYNC_PROPERTY) === 'true') {
		gs.addInfoMessage(gs.getEscapedMessage('Job submitted to create records in queue for category {0}', current.name));
		script = "var ci = new AssetandCI();ci.createAssetQueueForModelCategory('" + currentSysId + "');";
	} else {
		gs.addInfoMessage(gs.getEscapedMessage('Job submitted to create assets for category {0}', current.name));
		script = "var ci = new AssetandCI();ci.updateEmptyModels('" + currentSysId + "', '"
            + currentCmdbCiClass + "');ci.createMultipleAssets('" + currentSysId + "');";
	}
	var label = 'Generate Assets: ' + current.name;
	global.ModelUtils.submitJobwithDupCheck('Generate Assets', label, script, current.getUniqueValue());
}

// Call the function
executeJob();
