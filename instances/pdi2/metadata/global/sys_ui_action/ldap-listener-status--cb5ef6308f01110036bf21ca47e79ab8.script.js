function openMonitorPopUp(){
   var dialog = new GlideDialogWindow("ldap_listener_monitor");
   dialog.setWidth("800");
   dialog.setTitle(getMessage("LDAP Listener Status"));
   dialog.setPreference("ldap_server_id", g_form.getUniqueValue());
   dialog.render(); //Open the dialog
}
