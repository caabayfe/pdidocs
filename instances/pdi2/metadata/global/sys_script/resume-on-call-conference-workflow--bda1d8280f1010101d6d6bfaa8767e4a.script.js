(function executeRule(current, previous /*null when async*/ ) {

    try {
		var inputs = {};
		inputs['conference_call_sys_id'] = current.notify_conference_call + ""; // String 

		var result = sn_fd.FlowAPI.getRunner().subflow('global.resume_conference_call_escalation').inBackground().withInputs(inputs).run();
		
	} catch (ex) {
		var message = ex.getMessage();
		gs.error(message);
	}

    var contextGr = new GlideRecord("wf_context");
    contextGr.addQuery("id", current.notify_conference_call + "");
    contextGr.addQuery("state", "executing");
    contextGr.query();
    var wfScript = new SNC.WorkflowScriptAPI();
    if (contextGr.next()) {
        var ocEscRespGr = new GlideRecord("on_call_escalation_response");
        ocEscRespGr.addQuery("user", current.user + "");
        ocEscRespGr.addQuery("wf_context", contextGr.getUniqueValue());
        ocEscRespGr.query();
        if (ocEscRespGr.next())
            wfScript.broadcastEvent(contextGr.getUniqueValue(), "resume");


    }

})(current, previous);
