function onSubmit() {

    if (typeof showConfirmDialog === 'undefined')
        showConfirmDialog = true;

    if (!g_scratchpad.isModelDefDirty && g_form.modified && showConfirmDialog && g_scratchpad.isVersionPresent) {

        var trackFieldChangeList = ['field', 'entity', 'has_filter', 'filter_table', 'filter'];
        if (isAnyFieldModified(trackFieldChangeList)) {
            var callBackConfirmDialog = function() {
                showConfirmDialog = false;
                g_form.submit();
            };

            var dialogContent = getMessage("If you wish to change Breakdown Definition then the existing project definition versions will be eventually deleted. You need to click 'Mine Project' again for recalculation.");
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
	
	function isAnyFieldModified(trackFieldChangeList) {
        var modifiedFields = g_form.modifiedFields;
        for (var i = 0; i < trackFieldChangeList.length; i++) {
            if (modifiedFields.hasOwnProperty('promin_breakdown_field.' + trackFieldChangeList[i]) && modifiedFields['promin_breakdown_field.' + trackFieldChangeList[i]]) {
                return true;
            }
        }
        return false;
    }
}
