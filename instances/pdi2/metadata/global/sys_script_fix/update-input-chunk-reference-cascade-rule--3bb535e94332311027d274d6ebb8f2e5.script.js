var dic = new GlideRecord("sys_dictionary");
dic.addQuery("name", "sys_flow_context_inputs_chunk");
dic.addQuery("element", "document_id");
dic.query();

if (dic.next()) {
	gs.info("reference_cascade_rule of sys_flow_context_inputs_chunk before change is " + dic.getValue("reference_cascade_rule"));
	dic.setValue("reference_cascade_rule", "none");
	dic.setWorkflow(false);
	dic.update();
	gs.info("reference_cascade_rule of sys_flow_context_inputs_chunk after change is " + dic.getValue("reference_cascade_rule"));
}
