(function executeRule(current, previous /*null when async*/ ) {
    if (!shouldAddWarningMessage())
        return;

    var message = getOperationText();
    message += gs.getMessage("<br>In order to enable the mapping, open the mobile entity '{0}' and change the access control type to user criteria",
        current.mobile_entity.getDisplayValue());

    gs.addInfoMessage(message);

})(current, previous);

function shouldAddWarningMessage() {
    var mobileEntityTable = current.mobile_entity_table.toString();
    if (new UserCriteriaMappingUtils().isSupportedMobileEntityTableByAccessControl(mobileEntityTable)) {
        var gr = new GlideRecord(mobileEntityTable);
        gr.addQuery('sys_id', current.mobile_entity.toString());
        gr.query();

        if (gr.next() && gr.getValue('access_control_type') != 'user_criteria')
            return true;

    }

    return false;
}

function getOperationText() {
    if (current.operation() == 'insert')
        return gs.getMessage("The record was inserted successfully");

    return gs.getMessage("The record was updated successfully");
}
