answer = !isActiveFlow();

function isActiveFlow(){
	var triggerRecord = new GlideRecord('sys_metric_trigger_model');
	var flowSubQuery = triggerRecord.addJoinQuery('sys_flow_metric_trigger', 'sys_id', 'metric_trigger');
	triggerRecord.addQuery('model', current.getUniqueValue());
	flowSubQuery.addCondition('active', true);
	triggerRecord.query();
	return triggerRecord.next();
}
