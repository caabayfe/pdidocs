(function executeRule(current, previous /*null when async*/ ) {

    var intgCreationUtil = new global.IntegrationHubInstanceUtil();
    var recordId = intgCreationUtil.createIntegrationTableRecord(current.getValue('integration_table'), current.getValue('name'), current.getUniqueValue(), current.sys_scope.scope);
    if (gs.nil(recordId)) {
        gs.addErrorMessage(gs.getMessage("Unable to create Integration table record"));
        return;
    }
    current.record_id = recordId;
	current.update();

})(current, previous);
