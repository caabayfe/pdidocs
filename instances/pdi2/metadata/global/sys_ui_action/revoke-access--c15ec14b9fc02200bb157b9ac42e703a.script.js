function confirmAndRevoke() {
	tblName = g_list.getTableName();	
	
    var dd = new GlideModal("oauth_token_revoke_confirm_list_context_menu");
    dd.setTitle("Confirmation");
    dd.setWidth(275);
	
	dd.setPreference('sysparm_sys_id', rowSysId);
    dd.setPreference('sysparm_table_name', tblName);
    dd.render();
}
