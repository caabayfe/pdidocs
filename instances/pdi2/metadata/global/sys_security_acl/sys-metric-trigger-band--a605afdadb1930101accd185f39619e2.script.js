answer = !isActiveFlow();

function isActiveFlow(){
	var flowRecord = new GlideRecord('sys_flow_metric_trigger');
	flowRecord.addQuery('metric_trigger', current.sys_id);
	flowRecord.addQuery('active', 'true');
	flowRecord.query();
	return flowRecord.next();
}
