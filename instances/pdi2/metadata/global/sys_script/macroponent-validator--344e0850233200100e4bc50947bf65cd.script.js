(function executeRule(current, previous /*null when async*/) {

	if (JSUtil.notNil(current.ext_controller_dep) && UxFrameworkScriptables.isCBComponent(current.sys_id)) {
		new JsonValidatorForExtControllerDepField().validateJsonRecord(current);
	}

	var results = UxFrameworkScriptables.validateMacroponent(current);
	if (results.length !== 0) {
		gs.addErrorMessage(gs.getMessage('Validation results: {0}', results.join('; ')));
		gs.addInfoMessage(gs.getMessage('Record was saved.'));
	}
})(current, previous);
