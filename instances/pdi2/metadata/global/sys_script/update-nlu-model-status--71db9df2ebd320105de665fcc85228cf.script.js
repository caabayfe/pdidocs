(function executeRule(current, previous /*null when async*/ ) {
    var stateTypes = global.NLUConstants.MODEL_STATE_TYPES;
	var errorStates = ["4","8","9"];
    try {
        var lfApi = new LocalizationFrameworkAPIV2();
        var result = lfApi.hasRequestedItems(current.getValue('sys_id'));
        if (result === false && errorStates.indexOf(current.state) !== -1) global.NLUModel.updateSecondaryModelStatus(current.document, current.target_language, stateTypes.error_while_translating);
    } catch (e) {
        gs.error(JSON.stringify(e));
    }
})(current, previous);
