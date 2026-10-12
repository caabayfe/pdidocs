function onLoad() {
    g_form.setDisplay('selected_table', false);
    g_form.setDisplay('select_records_for_signing', false);
    if (g_form.getValue('type') == 'sign_specific_records' || g_form.getValue('type') == 'sign_specific_attachments') {
        g_form.setDisplay('select_records_for_signing', true);
        g_form.setMandatory('select_records_for_signing', true);
    } else if (newValue == 'mass_sign_records' || newValue == 'mass_sign_attachments')
        g_form.addInfoMessage(getMessage('This job will sign all records from the selected table. You can review the summary details on specifically which records were signed after the job has completed. Please use the Sign Specific Record or Sign Specific attachments jobs to sign individual records'));
}
