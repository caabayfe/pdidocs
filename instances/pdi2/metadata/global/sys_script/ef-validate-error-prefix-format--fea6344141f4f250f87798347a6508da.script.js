(function executeRule(current, previous /*null when async*/ ) {
    var prefix = current.error_prefix;
    var regex = /^SN-[A-Z]{2,4}$/;

    // Format validation
    if (!regex.test(prefix)) {
        var message = sn_i18n.Message.getMessage('error_framework', 'Error prefix must be in format SN-<APP_ID> (e.g., SN-DISC, SN-CMDB)');
        gs.addErrorMessage(message);
        current.setAbortAction(true);
        return;
    }

    // Duplicate check
    var existing = new GlideRecord(EFConstants.TABLES.ERROR_SOURCE_APPLICATION);
    existing.addQuery('error_prefix', prefix);
    if (!current.isNewRecord()) {
        existing.addQuery('sys_id', '!=', current.sys_id); // exclude current record on update
    }
    existing.query();
    if (existing.next()) {
        var message = sn_i18n.Message.getMessage('error_framework', 'Error prefix \'{prefix}\' already exists. Please use a unique prefix.', {prefix: prefix});
        gs.addErrorMessage(message);
        current.setAbortAction(true);
        return;
    }
})(current, previous);
