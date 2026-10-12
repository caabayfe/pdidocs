(function executeRule(current, previous /*null when async*/ ) {
	var inProgressStates = ["1", "2", "3", "5", "6"];
    try {
        var lfApi = new LocalizationFrameworkAPIV2();
        var result = lfApi.hasRequestedItems(current.getValue('sys_id'));
        if (result === false && inProgressStates.indexOf(current.state) !== -1) global.NLUModel.updateSecondaryModelStatus(current.document, current.target_language, 'draft');
    } catch (e) {
        gs.error(JSON.stringify(e));
    }
})(current, previous);
