function showDAIConfirmationDialog(){
   var dialog = new GlideDialogWindow("delete_app_inst_dialog");
   dialog.setTitle("Confirm");
   dialog.setPreference("sys_id", g_form.getUniqueValue());
   dialog.render();
}
