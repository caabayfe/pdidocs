(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	function isValidRequest(data) {
		return data.testIds && data.testIds.length;
	}

	var data = request.body.data;
	var testIds = data.testIds;

	if (!isValidRequest(data)) {
		response.setStatus(400);
		response.setBody({ errorMessage: "Invalid request, missing required fields." });
		return;
	}

	var executionGroupId = gs.generateGUID();
	var index;
	var gr;
	for (index = 0; index < testIds.length; index++) {
		gr = new GlideRecord('sys_cs_atf_queue');
		gr.initialize();
		gr.setValue('execution_group', executionGroupId);
		gr.setValue('test', testIds[index]);
		gr.setValue('status', 'queued');
		gr.insert();
	}

	gs.eventQueue('vad.trigger_atf_queue');
	var result = { executionGroupId: executionGroupId };

	response.setStatus(201);
	response.setBody(result);

})(request, response);
