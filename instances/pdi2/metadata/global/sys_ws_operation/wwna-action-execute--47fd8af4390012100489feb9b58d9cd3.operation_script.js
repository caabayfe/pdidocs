(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	const request_payload = {
		selected_text: request.body.data['SelectedText'],
		drafted_text: request.body.data['DraftedText'],
		skill_name: request.body.data['SkillName'],
		skill_description: request.body.data['SkillDescription'],
		document_table_name: request.body.data['DocumentTableName'],
		document_sys_id: request.body.data['DocumentSysId'],
		skill_id: request.body.data['SkillId'],
		trigger_source: 'WWNA_TRIGGER_SOURCE.REFINE',
		skill_config_id: request.body.data['SkillConfigId'],
		caller: 'mobile',
		context: ''
	};

	const external_key = gs.generateGUID();
	const params = [JSON.stringify({payload: request_payload, ambChannel: '/wwna/mobile/' + external_key})];

	const quickActionGR = new GlideRecord('wwna_quick_actions');
	quickActionGR.addQuery('command_name', request.body.data['ActionName']);
	quickActionGR.query();
	if(quickActionGR.next()){
		const evaluator = new GlideScopedEvaluator().withReturnError(true);
		evaluator.putVariable('params', params);
		evaluator.putVariable('selected_text', request_payload.selected_text);
		evaluator.putVariable('drafted_text', request_payload.drafted_text);
		const result = evaluator.evaluateScript(quickActionGR, 'script', params);
		
		if(result?.success) {
			const pollId = new MobileWWNA().startGenAIRequest(external_key, request_payload, request_payload.skill_id);
			return { PollId: pollId };
		} else {
			const error = new sn_ws_err.ServiceError();
			error.setStatus(500);
			error.setMessage(result);
			return error;
		}
	}
	
})(request, response);
