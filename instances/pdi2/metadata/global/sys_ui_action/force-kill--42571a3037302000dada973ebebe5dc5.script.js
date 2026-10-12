function displayForceKillWarningDialog() {
    var g_dialog = new GlideDialogWindow('dialog_force_kill');
    g_dialog.setTitle('Confirm Force Kill');
    g_dialog.setPreference('sysparm_session_id', g_form.getValue('session_id'));
    g_dialog.render();
    return false;
}
