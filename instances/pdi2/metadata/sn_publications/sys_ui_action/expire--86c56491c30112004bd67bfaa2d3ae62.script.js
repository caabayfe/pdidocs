function cancelFlows() {
    var flowContextRecord = new GlideRecord('sys_flow_context');
    flowContextRecord.addQuery('source_record', current.sys_id);
    flowContextRecord.query();
    while (flowContextRecord.next()) {
        var contextId = flowContextRecord.getValue('sys_id');
        sn_fd.FlowAPI.cancel(contextId, 'Canceling Flows due to Expire UI Button');
	}
}
current.stage = 'expired';
current.expiry_date = new GlideDateTime().getDisplayValue();

var workflow = new global.Workflow();
workflow.cancel(current);

cancelFlows();

current.update();
action.setRedirectURL(current);
