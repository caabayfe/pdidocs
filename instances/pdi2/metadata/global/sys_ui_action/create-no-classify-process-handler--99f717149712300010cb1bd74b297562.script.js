function showDNCConfirmationDialog(){
    var dialog = new GlideDialogWindow("create_dnc_process_handler_dialog");
    dialog.setTitle("Confirm");
    dialog.setPreference('my_sys_id',    g_form.getUniqueValue());
	dialog.setPreference('my_condition', g_form.getValue('condition'));
	dialog.setPreference('my_name',      g_form.getValue('name'));
    dialog.render();
}
