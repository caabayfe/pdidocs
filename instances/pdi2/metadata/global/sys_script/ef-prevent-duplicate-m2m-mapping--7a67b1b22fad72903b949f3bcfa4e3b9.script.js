(function executeRule(current, previous /*null when async*/ ) {

    var m2mGr = new GlideRecord(EFConstants.TABLES.ERROR_ACTIONS_M2M);
    m2mGr.addQuery('error_code', current.getValue('error_code'));
    m2mGr.addQuery('action', current.getValue('action'));

    if (!current.isNewRecord())
        m2mGr.addQuery('sys_id', '!=', current.getValue('sys_id'));

    m2mGr.setLimit(1);
    m2mGr.query();

    if (m2mGr.next()) {
        gs.addErrorMessage(sn_i18n.Message.getMessage('error_framework', `Insert/Update Failed: Action ("${m2mGr.getDisplayValue('action')}") is already mapped to error code "${current.getDisplayValue('error_code')}".`));
        current.setAbortAction(true);
        return;
    }

})(current, previous);
