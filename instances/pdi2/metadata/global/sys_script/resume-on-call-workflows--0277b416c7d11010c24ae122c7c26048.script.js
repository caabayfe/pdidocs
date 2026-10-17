(function executeRule(current, previous /*null when async*/ ) {
    var escRespGr = new GlideRecord('on_call_escalation_response');
    escRespGr.addQuery('source', current.getUniqueValue());
    escRespGr.query();
    while (escRespGr.next()) {
        if (escRespGr.wf_context) new Workflow().broadcastEvent(escRespGr.wf_context, 'resume');
        if (escRespGr.subflow_context) {
            try {
                sn_fd.FlowAPI.sendMessage(escRespGr.subflow_context, 'Resume per rota', 'Resume per rota');
            } catch (err) {
                gs.error("No Flow context found with the sys_id " + escRespGr.subflow_context + " Error - " + JSON.stringify(err));
            }
        }
    }
})(current, previous);
