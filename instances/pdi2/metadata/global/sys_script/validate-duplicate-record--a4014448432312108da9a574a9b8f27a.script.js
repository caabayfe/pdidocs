(function executeRule(current, previous /*null when async*/ ) {

    var fieldValueMap = {
        'provider': current.getValue('provider'),
        'name': current.getValue('name')
    };
    var recordExists = SNC.ProcessingFrameworkUtil.isDuplicateRecord(current.getTableName(), fieldValueMap);
    if (recordExists == true) {
        current.setAbortAction(true);
        var providerName = current.provider.getRefRecord().name;
        gs.addErrorMessage(gs.getMessage("Provider parameter '{0}' is already configured for provider '{1}'", [current.name, providerName]));
    }

})(current, previous);
