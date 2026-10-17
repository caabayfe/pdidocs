function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    g_form.clearMessages();
    if (g_form.getValue('type') != 'sign_specific_records' && g_form.getValue('type') != 'sign_specific_attachments')
        return;
    var arr = newValue.split(',');
    if (arr == undefined || arr.length != 2)
        return;
    var tableName = arr[1];
    g_form.setValue('selected_table', tableName);
    g_form.clearValue('conditions');
    g_form.setMandatory('select_records_for_signing', true);
    var leftBucket = gel('sys_signing_job.select_records_for_signing_left');
    var rightBucket = gel('sys_signing_job.select_records_for_signing_right');
    var availableOptions = leftBucket.options;
    leftBucket.options.length = 0;
    rightBucket.options.length = 0;
    var ga = new GlideAjax('CodeSigningUtil');
    ga.addParam('sysparm_name', 'getRecordsForSigning');
    ga.addParam('sysparm_table_name', tableName);
    ga.addParam('sysparm_conditions', ''); //when table name changes, no need to pass conditions, since this field will be reset
    ga.getXML(function(response) {
        var result = response.responseXML.getElementsByTagName('result');
        var recordsString = result[0].getAttribute('record');
        var errorMessage = 'Error while getting records on table:' + tableName;
        if (recordsString == null || recordsString.length == 0) {
            g_form.addErrorMessage(getMessage(errorMessage));
            return;
        }
        var records = JSON.parse(recordsString);
        if (records == null) {
            g_form.addErrorMessage(getMessage(errorMessage));
            return;
        }
        if (records.length == 0) {
            g_form.addErrorMessage(getMessage('No records in the table/matches filters'));
            return;
        }
        var limit = g_scratchpad.number_of_records_in_slushbucket;
        var msg = getMessage("Number of records in slush bucket is limited to '{0}' records").replace('{0}', limit);
        if (records.length >= limit)
            g_form.addInfoMessage(msg);
        for (var i = 0; i < Math.min(limit, records.length); i++) {
            var opt = new Option(records[i].displayString, records[i].sys_id);
            availableOptions[i] = opt;
        }
    });

}
