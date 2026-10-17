function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    g_form.clearValue('table');
    g_form.clearMessages(); //slushbucket mandatory message should be cleared when type is changed
    if (newValue == 'sign_specific_records' || newValue == 'sign_specific_attachments') {
        g_form.setDisplay('select_records_for_signing', true);
        g_form.setMandatory('select_records_for_signing', true);
        //clear table, conditions field and slushbuckets upon change of type of job
        g_form.clearValue('conditions');
        var leftBucket = gel('sys_signing_job.select_records_for_signing_left');
        var rightBucket = gel('sys_signing_job.select_records_for_signing_right');
        leftBucket.options.length = 0;
        rightBucket.options.length = 0;
        return;
    } else if (newValue == 'mass_sign_records' || newValue == 'mass_sign_attachments')
        g_form.addInfoMessage(getMessage('This job will sign all records from the selected table. You can review the summary details on specifically which records were signed after the job has completed. Please use the Sign Specific Record or Sign Specific attachments jobs to sign individual records'));
    g_form.setMandatory('select_records_for_signing', false);
    g_form.setDisplay('select_records_for_signing', false);
}
