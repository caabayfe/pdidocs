if (typeof formAlreadySubmitted == "undefined")
    var formAlreadySubmitted = false;

function onSubmit() {
    if (!formAlreadySubmitted && g_form.getControl("default_policy").changed && g_form.getValue("default_policy") === "allow_policy") {
        var msg = getMessage("Warning: Switching default policy to 'Allow Policy' may result in a lock out of users If the policy conditions in the allow access policy are not authored correctly. Please continue only if you have reviewed the policy conditions and understand the implications.");
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
    formAlreadySubmitted = true;
    g_form.submit();
}

function cancel() {
    formAlreadySubmitted = false;
}
