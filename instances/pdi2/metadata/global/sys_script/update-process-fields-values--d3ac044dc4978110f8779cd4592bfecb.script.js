(function executeRule(current, previous /*null when async*/ ) {
    if (!current.use_flow)
        return;
    var processNames = '';
    var doesNotSupportReset = current.passd_reset_flow.nil();
    var doesNotSupportChange = current.pwd_change_flow.nil();
    var doesNotSupportUnlock = current.unlock_user_flow.nil();
    var acceptsPassword = current.password_delivery_mechanism.nil() || current.password_delivery_mechanism == '0';

    var processGr = new GlideRecord("pwd_process");
    processGr.addQuery("cred_store.type", current.sys_id);
    processGr.query();

    while (processGr.next()) {
        if (doesNotSupportReset)
            processGr.setValue('reset', false);
        if (doesNotSupportChange)
            processGr.setValue('change', false);
        if (doesNotSupportUnlock)
            processGr.setValue('unlock_account', false);
        if (!acceptsPassword) {
            processGr.setValue('auto_gen_password', false);
            processGr.setValue('display_password', false);
            processGr.setValue('send_email', false);
        }
        processGr.setWorkflow(false);
        processGr.update();
        if (processGr.getValue('reset') != 1 && processGr.getValue('change') != 1 && processGr.getValue('unlock_account') != 1 && processGr.getValue('active') == 1) {
            processGr.setValue('active', false);
            processGr.update();
            processNames += processGr.getValue('label') + ", ";
        }
    }

    if (processNames) {
        processNames = processNames.substr(0, processNames.length - 2);
        gs.addInfoMessage(gs.getMessage("Following password reset processes marked as inactive: {0}. To use the processes, you must activate them.", processNames));
    }
})(current, previous);
