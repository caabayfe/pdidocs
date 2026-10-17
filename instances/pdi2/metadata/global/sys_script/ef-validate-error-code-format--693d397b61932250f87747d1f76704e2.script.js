(function executeRule(current, previous /*null when async*/ ) {
    // Step 1: Get the source application record
    var sourceApp = current.source_application.getRefRecord();
    var errorPrefix = sourceApp.error_prefix;

    // Step 2: Validate error prefix presence
    if (!errorPrefix) {
        var message = sn_i18n.Message.getMessage('error_framework', 'Error source application is missing a valid error prefix.');
        gs.addErrorMessage(message);
        current.setAbortAction(true);
        return;
    }

    // Step 3: Validate error code format: SN-<APP_ID>-XXXX
    var errorCode = current.error_code;
    var expectedFormat = new RegExp('^' + errorPrefix + '-\\\d{4}$');

    if (!expectedFormat.test(errorCode)) {
        var message = sn_i18n.Message.getMessage('error_framework', 'Error code must follow the format: {errorPrefix}-XXXX where XXXX is a 4-digit number.', {errorPrefix: errorPrefix});
        gs.addErrorMessage(message);
        current.setAbortAction(true);
        return;
    }

    // Step 4: Check for duplicate error code
    var gr = new GlideRecord(EFConstants.TABLES.ERROR_CODE);
    gr.addQuery('error_code', errorCode);
    if (!current.isNewRecord()) {
        gr.addQuery('sys_id', '!=', current.sys_id);
    }
    gr.setLimit(1);
    gr.query();
    if (gr.next()) {
        var message = sn_i18n.Message.getMessage('error_framework', 'Insert failed: Error Code "{errorCode}" already exists. Please use a unique code.', {errorCode: errorCode});
        gs.addErrorMessage(message);
        current.setAbortAction(true);
        return;
    }
})(current, previous);
