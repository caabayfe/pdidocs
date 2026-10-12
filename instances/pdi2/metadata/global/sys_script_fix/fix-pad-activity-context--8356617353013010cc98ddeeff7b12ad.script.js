var terminalStates = ["CANCELLED", "COMPLETE", "ERROR", "SKIPPED"];

var gr = new GlideRecord("sys_pd_activity_context");
gr.addQuery("state", "NOT IN", terminalStates.join());
gr.query();

while (gr.next()) {
	gr.setValue("activity_id", gr.getValue("activity"));
	gr.setWorkflow(false);
	gr.update();
}
