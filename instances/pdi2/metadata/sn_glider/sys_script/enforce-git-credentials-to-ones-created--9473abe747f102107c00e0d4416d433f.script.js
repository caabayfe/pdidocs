(function executeRule(current, previous /*null when async*/) {

    // no restrictions for maint and 'admin' user
    if (gs.getUser().hasRole('maint') || gs.getUser().hasRole('sn_glider.admin'))
        return;

    var assignedUser = current.getValue('user');
    if (!assignedUser) // maint user won't be selected
        return;

    var authCredentialTable = current.getValue('auth_credential_table');
    var authCredentialField = authCredentialTable === 'basic_auth_credentials' ? 'auth_credential' : 'auth_credential_oauth';
    var gr = new GlideRecord(authCredentialTable);
    gr.get(current.getValue(authCredentialField));
    if (!gr.isValid())
        return; // only check valid creddential record

    var grUser = new GlideRecord('sys_user');
    grUser.get(assignedUser);
    var assignedUserName = grUser.getValue('user_name');

    var creUser = new GlideRecord('sys_user');
    creUser.addQuery('user_name', gr.sys_created_by);
    creUser.query();
    creUser.next();

    if (creUser.getUniqueValue() === assignedUser)
        return; // assigned user also created the credential, return

    gs.addErrorMessage(gs.getMessage('glider_ide:invalid_credentials_assignment', [gr.sys_created_by, assignedUserName]));
    current.setAbortAction(true);

})(current, previous);
