var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "sys_flow_rw_action");
gr.addQuery("element", "flow_context");
gr.query();
if (gr.next()) {
	gr.setValue("internal_type", "reference");
	gr.setValue("reference", "sys_flow_context");
	gr.setValue("reference_cascade_rule", "delete");
	gr.setValue("attributes", "encode_utf8=false"); // to match the dictionary xml change
	gr.update();
	gs.info("Updated flow_context type of sys_flow_rw_action from string to reference.");
}
