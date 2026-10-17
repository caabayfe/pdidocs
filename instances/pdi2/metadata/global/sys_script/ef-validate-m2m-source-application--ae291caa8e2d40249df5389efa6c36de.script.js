(function executeRule(current, previous /*null when async*/) {

    var mismatches = [];

    var sourceAppId = current.getValue('source_application');
    var errorCodeId = current.getValue('error_code');
    var actionId = current.getValue('action');

    if (errorCodeId) {
        var ecGr = new GlideRecord('sys_error_code');
        if (ecGr.get('sys_id', errorCodeId) && ecGr.getValue('source_application') !== sourceAppId) {
            mismatches.push(sn_i18n.Message.getMessage('error_framework', 'Error Code "{name}"', { name: ecGr.getDisplayValue() }));
        }
    }

    if (actionId) {
        var actGr = new GlideRecord('sys_error_action');
        if (actGr.get('sys_id', actionId) && actGr.getValue('source_application') !== sourceAppId) {
            mismatches.push(sn_i18n.Message.getMessage('error_framework', 'Action "{name}"', { name: actGr.getDisplayValue() }));
        }
    }

    if (mismatches.length > 0) {
        gs.addErrorMessage(sn_i18n.Message.getMessage(
            'error_framework',
            'Insert/Update Failed: {mismatches} must belong to the selected Source Application.',
            { mismatches: mismatches.join(' and ') }
        ));
        current.setAbortAction(true);
    }

})(current, previous);
