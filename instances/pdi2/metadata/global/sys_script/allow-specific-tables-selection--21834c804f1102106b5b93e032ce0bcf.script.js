(function executeRule(current, previous /*null when async*/ ) {
    var mobileEntityTable = current.mobile_entity_table.toString();
    var mobileEntityId = current.mobile_entity.toString();
    var result = new UserCriteriaMappingUtils().isSupportedMobileEntityTable(mobileEntityTable, mobileEntityId);
	
    if (!result.answer) {
        var msg;
        switch (result.type) {
            case 'table':
                msg = gs.getMessage('The Mobile entity table {0} you chose is incompatible with the user criteria mapping', result.mobileEntityTable);
                break;
            case 'entity':
                msg = gs.getMessage('The Mobile entity type {0} you chose is incompatible with the user criteria mapping', result.mobileEntityTable);
                break;
            default:
                msg = gs.getMessage('Unknown type.');
                break;
        }

        gs.addErrorMessage(addMessage(msg));
        current.mobile_entity_table = previous.mobile_entity_table;
        current.mobile_entity = previous.mobile_entity;
        current.setWorkflow(false);
        current.setAbortAction(true);
    }

    function addMessage(msg) {
        return msg + '<br>' + new UserCriteriaMappingUtils().getMobileEntityMessage();
    }

})(current, previous);
