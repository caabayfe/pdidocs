(function executeRule(current, previous /*null when async*/ ) {

    var cancellationMessage = "Due to request cancellation by " + gs.getSession().getUserName();
    var flowContextGR = new GlideRecord('sys_flow_context');
    flowContextGR.addQuery('source_table', 'sc_request');
    flowContextGR.addQuery('source_record', current.sys_id);
    flowContextGR.query();
    while (flowContextGR.next()) {
        new sn_fd.FlowAPI.cancel(flowContextGR.getUniqueValue(), cancellationMessage);
    }

})(current, previous);
