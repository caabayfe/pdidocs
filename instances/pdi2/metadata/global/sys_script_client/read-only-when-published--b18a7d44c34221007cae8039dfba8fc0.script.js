function onLoad() {
	if(g_form.isNewRecord()) {
		return;
	}
	
	var ga = new GlideAjax("WorkflowElementActivityAjax");
	ga.addParam("sysparm_name", "canEdit");
	ga.addParam("sysparm_activity_id", g_form.getUniqueValue());
	ga.getXMLWait();
	// Cannot edit, make fields read-only
	if (ga.getAnswer() == "false") {
		// wf_element_definition fields
		g_form.setReadOnly("name", true);
		g_form.setReadOnly("base_provider", true);
		g_form.setReadOnly("category", true);
		g_form.setReadOnly("image", true);
		g_form.setReadOnly("description", true);
		g_form.setReadOnly("short_description", true);
		g_form.setReadOnly("multi-col-list-add", true);
		g_form.setReadOnly("access", true);
	}
}
