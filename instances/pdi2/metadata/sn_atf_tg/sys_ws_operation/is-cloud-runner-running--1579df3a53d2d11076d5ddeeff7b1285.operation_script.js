(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var gr = new GlideRecord('sn_atf_tg_sn_boq');
	gr.addQuery('job_qualified_name', '@dotwalk/atf-test-runner-server/TestRunSNBOQJob');
	gr.addQuery('state', 'processing').addOrCondition('state', 'browsers_requested').addOrCondition('state', 'running').addOrCondition('state', 'processing_started');
	gr.query();
	response.setBody({
		value: gr.hasNext()
	});
	response.setStatus(200);

})(request, response);
