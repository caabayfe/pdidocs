(function executeRule(current, previous /*null when async*/ ) {
    checkProcessingMode(current, previous);
})(current, previous);

function checkProcessingMode(current, previous) {

    if (isSyncInProgress()) {
        // if in progress, don't allow, as it may cause to fall back on default in the backend
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Cannot change value when user role history sync is IN_PROGRESS.'));
        return;
    }

    var allowedValues = ['PARALLEL', 'SEQUENTIAL'];

    // ensure only allowed value for processing mode can be set irrespective of user role history feature is turned on or not.
    if (invalidValueSpecifiedForProcessingMode(current, allowedValues)) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Supported values for {0} are: {1}, please specify one of the values listed here (case-insensitive).', [current.name, allowedValues.toString()]));
        return;
    }
    return;
}

function invalidValueSpecifiedForProcessingMode(current, allowedValues) {
    var trimmedValue = current.value.trim();
    if (!allowedValues.includes(trimmedValue.toUpperCase()))
        return true;
    return false;
}

function isSyncInProgress() {
    var v = new GlideRecord('sys_user_role_history_sync_status');
    if (!v.isValid())
        return false;
    v.addQuery('status', 'IN_PROGRESS');
    v.query();
    v.setLimit(1);
    if (v.hasNext())
        return true;
    return false;
}
