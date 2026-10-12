function onLoad() {
    var jobType = g_form.getValue('type');
    if (jobType == 'mass_sign_records' || jobType == 'mass_sign_attachments' || jobType == 'sign_update_set')
        g_form.addInfoMessage(getMessage('Please use Signing Job option to create Mass Sign Record, Mass Sign Attachments, and Sign Update Set jobs'));
}
