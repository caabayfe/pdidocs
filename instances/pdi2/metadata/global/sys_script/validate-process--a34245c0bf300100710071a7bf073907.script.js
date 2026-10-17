check();

function check() {


    if (!current.reset && !current.change && !current.unlock_account) {
        throwError(gs.getMessage("You must select at least one of the 'Password change' or the 'Password reset' or the 'Enable account unlock' options"));
    }

    // check that process has a single credential store associated to it:
    if (current.cred_store.nil()) {
        throwError(gs.getMessage("You must specify a credential store for the process"));
    } else {
        var use_flow = current.cred_store.type.use_flow;
        if (use_flow) {
            var acceptPassword = current.cred_store.type.password_delivery_mechanism.nil() || current.cred_store.type.password_delivery_mechanism == '0';
            if (current.unlock_account && current.cred_store.type.unlock_user_flow.nil())
                throwError(gs.getMessage("You cannot select 'Enable account unlock' for the type of credential store that you specified. Provide unlock_user_flow in the credential store."));
            if (current.change && current.cred_store.type.pwd_change_flow.nil())
                throwError(gs.getMessage("You cannot select the 'Change Password' option for the type of credential store that you specified. Provide password change flow in the credential store."));
            if (current.reset && current.cred_store.type.passd_reset_flow.nil())
                throwError(gs.getMessage("You cannot select the 'Reset Password' option for the type of credential store that you specified. Provide password reset flow in the credential store."));
            if (!acceptPassword && (current.auto_gen_password || current.display_password || current.send_email)) {
                throwError(gs.getMessage("You cannot select the 'Auto-generate password' or 'Display Password' or 'Email Password' option for the type of credential store that you specified since it doesn't accept password."));
            }
        } else {
            if (current.unlock_account && current.cred_store.type.unlock_user_wf.nil())
                throwError(gs.getMessage("You cannot select 'Enable account unlock' for the type of credential store that you specified. Provide unlock user workflow in the credential store."));
            if (current.change && current.cred_store.type.pwd_change_wf.nil())
                throwError(gs.getMessage("You cannot select the 'Change Password' option for the type of credential store that you specified. Provide password change workflow in the credential store."));
            if (current.reset && current.cred_store.type.passd_reset_wf.nil())
                throwError(gs.getMessage("You cannot select the 'Reset Password' option for the type of credential store that you specified. Provide password reset workflow in the credential store."));
        }
    }

    if (!current.active) {
        gs.addInfoMessage(gs.getMessage("To use the process, you must select the Active checkbox"));
        return;
    }

    // Min verifications only applies if Reset Password is enabled since Change Password does not require verifications 
    if (current.reset || current.unlock_account) {
        if ((current.min_verifications < 1) || (current.min_verifications > 10)) {
            throwError(gs.getMessage("You must specify a number between 1 and 10 for 'Minimum verifications'"));
            return;
        }

        var procVerMapGr = new GlideRecord('pwd_map_proc_to_verification');
        procVerMapGr.addQuery('process', current.sys_id);
        procVerMapGr.query();
        var mappedVerificationsCount = procVerMapGr.getRowCount();
        if (current.active && current.min_verifications > mappedVerificationsCount) {
            throwError(gs.getMessage("You must configure at least as many verifications as are specified in 'Minimum verifications'"));
            return;
        }

        while (procVerMapGr.next()) {
            var verificationTypeId = procVerMapGr.verification.type;
            //Preventing personal data confirmation verification for a public process
            if (verificationTypeId == "a7f17087eb1101004d7763fba206fe52" && current.public_access)
                throwError(gs.getMessage("Personal data confirmation verification can't be configured for a public process"));
            else if (verificationTypeId == "a67585845302011017c3ddeeff7b1267" && !current.public_access) //Preventing Soft PIN verification for a service desk process
                throwError(gs.getMessage("Soft PIN verification can't be configured for a service desk process"));
        }
    }

    // check that process has at least one user group or it applies to all users
    var processRelatedToAllUsersOrGroup = false;

    // 1. check current value of the flag "Apply to all users"
    if (current.apply_to_all_users) {
        processRelatedToAllUsersOrGroup = true;
    }

    // 2. check process group mappings
    gr = new GlideRecord('pwd_map_proc_to_group');
    gr.addQuery('process', current.sys_id);
    gr.query();
    if (gr.getRowCount() > 0) {
        processRelatedToAllUsersOrGroup = true;
    }

    // if processRelatedToAllUsersOrGroup is false, then show error
    if (!processRelatedToAllUsersOrGroup) {
        throwError(gs.getMessage("You must either select the 'Apply to all users' option or specify at least one group"));
    }

    if ((current.reset || current.unlock_account) && current.active && (!current.email_password_reset_url) && current.public_access && !isProcessSecure(current)) {
        throwError(gs.getMessage("To use this password reset process, either enable the 'Email Password Reset URL' option or configure the verifications with multi-factor authentication."));
        return;
    }
}

function isProcessSecure(current) {
    var secureVerificationsCount = 0;
    var nonSecureVerificationCount = 0;
    var mandatorySecureVerificationCount = 0;

    gr = new GlideRecord('pwd_map_proc_to_verification');
    gr.addQuery('process', current.sys_id);
    gr.query();
    while (gr.next()) {
        var grVerificationType = new GlideRecord("pwd_verification");
        grVerificationType.get(gr.getValue('verification'));
        grVerificationType.query();
        var mandatory = gr.mandatory;
        if (PwdConstants.NONSECURE_VERIFICATIONTYPES[grVerificationType.getValue('type')] == true) {
            nonSecureVerificationCount++;
        } else {
            secureVerificationsCount++;
            if (mandatory == true)
                mandatorySecureVerificationCount++;
        }
    }

    return ((mandatorySecureVerificationCount > 0) || (nonSecureVerificationCount < current.min_verifications));
}

function throwError(errorMessage) {
    gs.addErrorMessage(errorMessage);
    current.setAbortAction(true);
}
