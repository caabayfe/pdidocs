function confirmAndRevoke() {
	tblName = g_list.getTableName();
    selSysIds = g_list.getChecked();
 
    var dd = new GlideModal("oauth_token_revoke_confirm_list");
    dd.setTitle("Confirmation");
    dd.setWidth(275);
	
	dd.setPreference('sysparm_obj_list', selSysIds);
    dd.setPreference('sysparm_table_name', tblName);
    dd.render();
}
