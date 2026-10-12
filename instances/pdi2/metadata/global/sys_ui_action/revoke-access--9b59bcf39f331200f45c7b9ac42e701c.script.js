function confirmAndRevoke() {
	objSysId = g_form.getUniqueValue();
    tblName = g_form.getTableName();
 	
    var dd = new GlideModal("oauth_token_revoke_confirm_form");
    dd.setTitle("Confirmation");
    dd.setWidth(275);
	
	dd.setPreference('sysparm_obj_id', objSysId);
    dd.setPreference('sysparm_table_name', tblName);
    dd.setPreference('sysparm_parent_form', this);
    dd.render();
}
