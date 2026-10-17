(function executeRule(current, previous /*null when async*/ ) {

    var gr = new GlideRecord('sys_cs_live_agent_setup');
    gr.addQuery('sys_domain', current.sys_domain);
    gr.query();

    if (gr.hasNext()) {
        gs.addErrorMessage(gs.getMessage('Only one Chat Setup record is allowed per domain'));
        current.setAbortAction(true);
        return;
    }

})(current, previous);
