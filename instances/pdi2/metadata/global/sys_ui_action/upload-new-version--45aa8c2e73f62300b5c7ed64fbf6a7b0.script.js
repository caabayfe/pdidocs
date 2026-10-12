function uploadNewVersion() {
    var currentSysId = g_form.getUniqueValue();
    var g_import_modal_window = new GlideModal("kb_import_dialog");
    g_import_modal_window.setPreference('knowledge_sys_id', currentSysId);
    g_import_modal_window.setTitle(getMessage('Import a Word File'));
    g_import_modal_window.render();
}
