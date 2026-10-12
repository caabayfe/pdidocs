function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
    // proceed with change if Active field is made true
    if (newValue === "true") {
        doComplete();
        return;
    }

    // render confirmation modal if Active field is made false
    var dialog = getGlideModal();
    dialog.setPreference('onPromptComplete', doComplete);
    dialog.setPreference('onPromptCancel', doCancel);
    dialog.render();

    function doComplete() {
        callback(true);
    }

    function doCancel() {
        callback(false);
    }
}

function getGlideModal() {
    var subDialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
    var subDialog = new subDialogClass('glide_confirm_standard');
    subDialog.setTitle(getMessage("Are you sure?"));
    subDialog.setPreference('warning', true);
    subDialog.setPreference('title', getMessage("We recommend not deactivating data snapshots collection jobs to avoid data gaps if there is no classic performance analytics data collection job available for the indicators."));
    return subDialog;
}
