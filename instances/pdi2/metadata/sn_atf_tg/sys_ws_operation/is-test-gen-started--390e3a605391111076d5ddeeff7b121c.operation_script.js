(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	// implement resource here
	var gr = new GlideRecord('sn_atf_tg_sn_boq');
	var isRunning = false;
	gr.addQuery('job_qualified_name', '@dotwalk/atf-bootstrap/TestGenerationSNBOQJob');
	var q = gr.addQuery('state', 'pending');
	q.addOrCondition('state', 'processing').addOrCondition('state', 'browsers_requested').addOrCondition('state', 'running').addOrCondition('state', 'processing_started');
	gr.query();
	response.setBody({
		value: gr.next()
	});
	response.setStatus(200);
	
})(request, response);
