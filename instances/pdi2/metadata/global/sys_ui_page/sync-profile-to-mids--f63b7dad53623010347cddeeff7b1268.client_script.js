function actionOK() {
    var profileIds = gel("profileIds").value.split(",");
    var sync_strategy = gel("sync_strategy").value;
    var fromUIAction = gel("fromUIAction");
    var syncWrapperOverride = gel("sync_wrapper_override").checked;
    var restartMidServer = gel("restart_mid_server").checked;
    if (sync_strategy != 'do_nothing') {
        for (var i = 0; i < profileIds.length; i++) {
            var msAjax = new GlideAjax("MIDServerAjax");
            msAjax.addParam("sysparm_name", "syncProfileToMids");
            msAjax.addParam("sysparm_profile_id", profileIds[i]);
            msAjax.addParam("sysparm_sync_strategy", sync_strategy);
            msAjax.addParam("sysparm_perform_wrapper_sync", syncWrapperOverride);
            msAjax.addParam("sysparm_restart_allowed", restartMidServer);
            msAjax.getXMLAnswer(null);
        }
    }
    if (!fromUIAction)
        g_form.save();
    GlideDialogWindow.get().destroy();
}

function actionCancel() {
    GlideDialogWindow.get().destroy();
    return false;
}

function toggleRestartCheckbox() {
    var restartCheckboxContainer = document.getElementById('restart_checkbox_container');
    var syncWrapperOverride = document.getElementById('sync_wrapper_override');
    if (syncWrapperOverride.checked) {
        restartCheckboxContainer.style.display = 'block';
    } else {
        restartCheckboxContainer.style.display = 'none';
    }
}
