(function executeRule(current, previous /*null when async*/ ) {
    var requiredFields = ['source_sys_id', 'file_name', 'file_type', 'redaction_type', 'status', 'triggered_by'];

    for (var i = 0; i < requiredFields.length; i++) {
        if (gs.nil(current.getValue(requiredFields[i]))) {
            gs.warn('ds_redaction_audit_log: Insert aborted. ' + requiredFields[i] + ' is not provided. source_sys_id=' + current.source_sys_id + ', file_name=' + current.file_name);
            current.setAbortAction(true);
            return;
        }
    }

    if (current.status == 'success' && gs.nil(current.redacted_sys_id)) {
		gs.warn('ds_redaction_audit_log: Insert aborted. redacted_sys_id is required when status is success');
        current.setAbortAction(true);
    }

})(current, previous);
