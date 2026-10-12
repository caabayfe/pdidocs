function updateItemParameterReferenceQualifier() {
	gs.info('[updateItemParameterReferenceQualifier]: execution started');
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('reference_qual','CONTAINS', "'parent=' + current.screen.data_item.sys_id;");
	gr.addQuery('name', 'sys_sg_screen_param_map');
	gr.addQuery('element', 'item_parameter');
	gr.query();

	while(gr.next()) {
		gs.info('[updateItemParameterReferenceQualifier]: next record');
		gr.setValue('reference_qual', "javascript: new GetScreenItemParametersQueryString().getItemParametersQS();");
		gr.setWorkflow(false);
		gr.update();
	}
}

gs.info('[updateItemParameterReferenceQualifier]: running script');
updateItemParameterReferenceQualifier();
