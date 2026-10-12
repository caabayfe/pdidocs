function onSubmit() {
	g_form.hideFieldMsg("name");
	if(g_form.getValue("request_type")=="edit_group")
		if(g_form.getValue("name")==g_form.getDisplayBox("ownership_group").value)
			return true;

	var grpGr = new GlideRecord("sys_user_group");
	grpGr.addQuery("name", g_form.getValue("name"));
	if(g_form.getValue("ownership_group")!=""){
		grpGr.addQuery("sys_id","!=",g_form.getValue("ownership_group"));
	}
	grpGr.query();
	if (grpGr.hasNext()) {
		g_form.showFieldMsg("name", getMessage("User group name already exists. Choose a different (user group) name."), "error");
		return false;
	}
}
