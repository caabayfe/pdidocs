(function executeRule(current, previous /*null when async*/ ) {
    var flowGr = new GlideRecord('sys_hub_flow');
    var flows = flowGr.addQuery('sys_id', current.incoming_call_subflow);
    flows.addOrCondition('sys_id', current.incoming_sms_subflow);
    flows.addOrCondition('sys_id', current.outgoing_call_subflow);
    flows.addOrCondition('sys_id', current.outgoing_sms_subflow);
    flowGr.query();

    while (flowGr.next()) {
        if (!(flowGr.status == "published") || !(flowGr.active == true)) {
            gs.addInfoMessage(gs.getMessage('<b>Warning:</b> Subflow \'{0}\' is not configured correctly. The flow is either not published or is inactive', flowGr.name));
        }
    }
})(current, previous);
