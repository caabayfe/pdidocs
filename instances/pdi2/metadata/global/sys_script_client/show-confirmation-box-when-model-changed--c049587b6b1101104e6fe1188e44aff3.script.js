function onSubmit() {

    if (!g_form.isNewRecord() && g_form.modified && !g_scratchpad.isModelDefDirty && g_scratchpad.isVersionPresent) {

        if (typeof showConfirmDialog === 'undefined')
            showConfirmDialog = true;

        var fields = ["filter", "report_source", "source_type"];
        var isNotAllowedFieldModified = false;
        var modifiedFields = g_form.modifiedFields;

        for (var fieldName in modifiedFields) {
            if (fields.includes(fieldName.replace('promin_project_entity.', ''))) {
                isNotAllowedFieldModified = true;
                break;
            }
        }

        if (isNotAllowedFieldModified && showConfirmDialog) {
            var callBackConfirmDialog = function() {
                showConfirmDialog = false;
                gsftSubmit(null, g_form.getFormElement(), g_form.getActionName());
            };

            var dialogContent = getMessage("If you wish to change Project Entity then the existing Project definition versions will be eventually deleted. You need to click 'Mine Project' again for recalculation.");
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
}
