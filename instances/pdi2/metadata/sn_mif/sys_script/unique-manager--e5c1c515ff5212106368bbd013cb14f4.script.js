(function executeRule(current, previous /*null when async*/ ) {
    var mgmtGr = new GlideRecord('sn_mif_managed_by_instance'),
    isGlobalManager = gs.nil(current.getValue('application'));

    if (isGlobalManager)
        mgmtGr.addNullQuery('application');
    else
        mgmtGr.addQuery('application', current.getValue('application'));

    mgmtGr.addNotNullQuery('managing_instance');
    mgmtGr.addQuery('approval', 'approved').addOrCondition('approval', 'auto-approved').addOrCondition('approval', 'awaiting-confirmation');
    mgmtGr.addQuery('sys_id', '!=', current.sys_id);
    mgmtGr.setLimit(1);
    mgmtGr.query();

    if (mgmtGr.next()) {
        var errorMsg = gs.getMessage(isGlobalManager ?
            'The current instance already has a global manager instance.' :
            'The current instance already has a manager instance for ' + mgmtGr.getDisplayValue('application') + '.');

        gs.addErrorMessage(errorMsg);
        gs.error(errorMsg);
        current.setAbortAction(true);
    }
})(current, previous);
