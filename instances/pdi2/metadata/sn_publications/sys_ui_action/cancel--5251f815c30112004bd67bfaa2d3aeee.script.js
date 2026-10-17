function cancelFlows() {
    var flowContextRecord = new GlideRecord('sys_flow_context');
    flowContextRecord.addQuery('source_record', current.sys_id);
    flowContextRecord.query();
    while (flowContextRecord.next()) {
        var contextId = flowContextRecord.getValue('sys_id');
        sn_fd.FlowAPI.cancel(contextId, 'Canceling Flows due to Cancel UI Button');
	}
}
current.stage = 'cancelled';
var workflow = new global.Workflow();

workflow.cancel(current);

cancelFlows();
current.update();

action.setRedirectURL(current);
