function onLoad() {
    if (g_form.getValue('type') != 'sign_specific_records' && g_form.getValue('type') != 'sign_specific_attachments')
        return;
    var jobTypeTable = g_form.getValue('table');
    var arr = jobTypeTable.split(',');
    if (arr == undefined || arr.length != 2)
        return;
    var table = arr[1];
    var condition = g_form.getValue('conditions');
    g_form.setReadOnly('conditions', true);
    var selected = document.getElementById('sys_signing_job.select_records_for_signing').value;
    selected = selected.split(',');
    var availableDefaultReferenceField = gel('sys_signing_job.select_records_for_signing_left');
    var selectedDefaultReferenceField = gel('sys_signing_job.select_records_for_signing_right');
    var availableOptions = availableDefaultReferenceField.options;
    var selectedOptions = selectedDefaultReferenceField.options;
    availableDefaultReferenceField.options.length = 0;
    var handleTableSelection = function(response) {
        var leftBucket = 'sys_signing_job.select_records_for_signing_left';
        var rightBucket = 'sys_signing_job.select_records_for_signing_right';
        var result = response.responseXML.getElementsByTagName('result');
        var recordsString = result[0].getAttribute('record');
        var errorMessage = 'Error while getting records';
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
        for (var i = 0, j = 0; i < Math.min(limit, records.length); i++) {
            //check if given record's sys_id is found in select_records_for_signing field's value
            var index = selected.indexOf(records[i].sys_id);
            if (index > -1) {
                //add the option to right slush bucket
                var opt2 = new Option(records[i].displayString, records[i].sys_id);
                selectedOptions[j] = opt2;
                j++;
                continue;
            }
            //add the option to left slush bucket
            var opt = new Option(records[i].displayString, records[i].sys_id);
            //i- j will be the index for the availableOptions in left bucket. If an item is selected in rightbucket, in leftbucket we should not add this item and decrease index by selected item/s.
            availableOptions[i - j] = opt;
        }
    };
    var ga = new GlideAjax('CodeSigningUtil');
    ga.addParam('sysparm_name', 'getRecordsForSigning');
    ga.addParam('sysparm_table_name', table);
    ga.addParam('sysparm_conditions', condition);
    ga.getXML(handleTableSelection);
}
