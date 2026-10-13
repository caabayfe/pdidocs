function showNAITConfirmationDialog(){
    var dialog = new GlideDialogWindow("create_app_inst_table_dialog");
    dialog.setTitle("Confirm");
    dialog.setPreference('my_sys_id',    g_form.getUniqueValue());
    dialog.render();
}
