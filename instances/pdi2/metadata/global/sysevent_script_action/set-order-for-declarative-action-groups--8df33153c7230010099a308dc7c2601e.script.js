var gr = new GlideRecord("sys_declarative_action_group");
if (gr.isValid()) {
	gr.query();
	while (gr.next()) {
		if (gr.getValue("order") == null) {
			gr.setValue("order", 100);
			gr.setWorkflow(false);
			gr.update();
		}
	}
}
