if (typeof formAlreadySubmitted == "undefined")
    var formAlreadySubmittedForMfa = false;

function onSubmit() {
    if (!formAlreadySubmittedForMfa && g_form.getControl("default_policy").changed && g_form.getValue("default_policy") === "stepdown_mfa_policy") {
        var msg = getMessage("Warning: Switching Default Policy to Step-Down MFA Policy will override the MFA enforcement configured at User level or Role level if the Step-Down MFA Policy's condition(s) evaluate to true. Please continue only if you have reviewed the policy conditions and understand the implications.");
        var dialog = new GlideModal('glide_modal_confirm', true, 400);
        dialog.setTitle(new GwtMessage().getMessage('Confirmation'));
        dialog.setPreference('body', new GwtMessage().format(msg));
        dialog.setPreference('focusTrap', true);
        dialog.setPreference('onPromptComplete', confirm);
        dialog.setPreference('onPromptCancel', cancel);
        dialog.setPreference('buttonLabelComplete', new GwtMessage().getMessage('OK'));
        dialog.setPreference('buttonLabelCancel', new GwtMessage().getMessage('Cancel'));
        dialog.render();
        return false;
    }
    return true;
}

function confirm() {
    formAlreadySubmittedForMfa = true;
    g_form.submit();
}

function cancel() {
    formAlreadySubmittedForMfa = false;
}
