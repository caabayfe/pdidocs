(function executeRule(current, previous /*null when async*/) {

	var fieldValueMap = {
        'name': current.getValue('name')
    };
    var recordExists = SNC.ProcessingFrameworkUtil.isDuplicateRecord(current.getTableName(), fieldValueMap);
    if (recordExists == true) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("Provider parameter definition '{0}' already exists.", current.name));
    }

})(current, previous);
