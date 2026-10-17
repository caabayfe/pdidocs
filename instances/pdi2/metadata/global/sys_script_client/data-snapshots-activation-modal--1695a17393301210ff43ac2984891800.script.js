function onCellEdit(sysIDs, table, oldValues, newValue, callback) {

    if (newValue === "false") {
        doComplete();
        return;
    }

    var dialog = getGlideModal();
    dialog.setPreference('onPromptComplete', doComplete);
    dialog.setPreference('onPromptCancel', doCancel);
    dialog.setPreference('sysIDs', sysIDs);
    dialog.setPreference('sysparm_trigger', "list");
    dialog.render();

    function doComplete() {
        callback(true);
    }

    function doCancel() {
        callback(false);
    }
}

function getGlideModal() {
    var dialog = new GlideModal('pa_enable_datasnapshots', true, 900);
    dialog.setPreference('focusTrap', true);
    dialog.setWidth(550);
    return dialog;
}
