(function executeRule(current, previous /*null when async*/) {
	
	var stepState = current.state;
	var stageRecord = new GlideRecord('sc_service_fulfillment_stage_data');
	
	if (previous.state == 'failed' || previous.state == 'complete' || previous.state == 'canceled')
		return;
	
	if (!stageRecord.get(current.service_fulfillment_stage_data.sys_id) || stageRecord.getValue('state') == 'failed')
		return;
	
	if (stepState == 'failed'){
		stageRecord.setValue('state','failed');
		stageRecord.update();
	} else if (stepState == 'complete' || stepState == 'canceled') {
		var siblingSteps = new GlideRecord('sc_service_fulfillment_step_data');		
		siblingSteps.addQuery('service_fulfillment_stage_data', current.service_fulfillment_stage_data.sys_id);
		siblingSteps.addEncodedQuery('stateNOT INcomplete,canceled');
		siblingSteps.query();
		
		if (!siblingSteps.hasNext()) {
			stageRecord.setValue('state', 'complete');
			stageRecord.update();
		}
	}
	
})(current, previous);
