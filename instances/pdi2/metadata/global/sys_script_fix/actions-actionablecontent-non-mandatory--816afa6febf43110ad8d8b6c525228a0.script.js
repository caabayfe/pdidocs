if (!pm.isZboot()){
	var gr = new GlideRecord("sys_dictionary");
	gr.addQuery("name", "sys_notification_actionable_content");
	gr.addQuery("element", "actions");
	gr.setWorkflow(false);
	gr.query();
	if (gr.next()) {
		gr.setValue("mandatory", false);
		gr.update();
	}
}
