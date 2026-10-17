if (!pm.isZboot()) {
	var gr = new GlideRecord("sys_dictionary");
	gr.addQuery("name", "sys_ux_form_action_layout_item");
	gr.addQuery("element", "color");
	gr.query();

	if (gr.next()) {
		gr.setValue("use_dependent_field", true);
		gr.setValue("dependent", "layout_group.type");
		gr.setValue("dependent_on_field", "layout_group.type");
		gr.update();
	}
}
