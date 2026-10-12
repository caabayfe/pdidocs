function onSubmit() {
    if (typeof showConfirmDialog === 'undefined')
        showConfirmDialog = true;

    if (!g_scratchpad.isModelDefDirty && g_form.modified && showConfirmDialog && g_scratchpad.isVersionPresent) {
        var callBackConfirmDialog = function() {
            showConfirmDialog = false;
            g_form.submit();
        };



        var dialogContent = getMessage("If you wish to change Child Table Definition then the existing model definition versions will be eventually deleted. You need to click 'Mine Project' again for recalculation.");
        var subDialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
        var subDialog = new subDialogClass('glide_confirm_standard');
        subDialog.setTitle(getMessage("Are you sure?"));
        subDialog.setPreference('warning', true);
        subDialog.setPreference('title', dialogContent);
        subDialog.setPreference('onPromptComplete', callBackConfirmDialog);
        subDialog.render();
        return false;
    }

}
