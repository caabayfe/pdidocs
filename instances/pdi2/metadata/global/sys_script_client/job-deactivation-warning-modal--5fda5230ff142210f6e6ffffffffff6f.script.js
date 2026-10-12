var confirmDialogShown = false;

function onSubmit() {
    if (g_form.getValue('active') == 'false') {
        if (confirmDialogShown) {
            confirmDialogShown = false;
            return true;
        }
        confirmDialogShown = true;

        var callBackConfirmDialog = function() {
            gsftSubmit(null, g_form.getFormElement(), 'sysverb_update');
        };

        var cancelCallback = function() {
            confirmDialogShown = false;
        };

        var dialogContent = getMessage("We recommend not deactivating data snapshots collection jobs to avoid data gaps if there is no classic performance analytics data collection job available for the indicators.");

        var subDialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
        var subDialog = new subDialogClass('glide_confirm_standard', true);
        subDialog.setTitle(getMessage("Are you sure?"));
        subDialog.setPreference('warning', true);
        subDialog.setPreference('title', dialogContent);
        subDialog.setPreference('onPromptComplete', callBackConfirmDialog);
        subDialog.setPreference('onPromptCancel', cancelCallback);
        subDialog.render();
        return false;
    }
    return true;
}
