(function executeRule(current, previous /*null when async*/ ) {
    var gr = GlideRecord("sys_cs_context_profile_message");
    gr.addQuery('context_profile', current.context_profile);
    gr.addQuery('type', current.type);
	gr.query();
    if (gr.next()) {
        gs.addErrorMessage(gs.getMessage('Duplicate insertion aborted'));
        current.setAbortAction(true);
    }
})(current, previous);
