function popupUserSetHistory() {
	
	var popupTitle = g_scratchpad.viewUserSetHistory;
	
	//Initialize the GlideDialogWindow
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    var gdw = new dialogClass("sub_mgmt_audit_log_template");
	
    gdw.setTitle(popupTitle);
	gdw.setSize(650);
    gdw.setPreference('sysparm_table_name', 'sys_user_set_audit_log');
    gdw.setPreference('sysparm_view', 'user_set_audit_popup_view');
 
    //Set the table to display
    var userSetName = g_form.getValue('name');
    var query = "user_set_name=" + userSetName + "^ORDERBYDESCtime_stamp";
    gdw.setPreference('sysparm_query', query);
	
    //Open the dialog window
    gdw.render();
}
