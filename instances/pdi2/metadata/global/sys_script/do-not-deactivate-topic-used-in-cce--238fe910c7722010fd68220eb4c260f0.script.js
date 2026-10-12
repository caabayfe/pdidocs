(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('sys_cs_context_profile_topic');
    gr.addQuery('topic', current.getUniqueValue());
    gr.query();
    if (gr.next()) {
        gs.addErrorMessage(gs.getMessage('Unable to deactivate topic: This topic is used in a custom chat experience. Please remove the topic from the chat experience to proceed.'));
        current.setAbortAction(true);
    }

    var grp = new GlideRecord('sys_cs_context_profile_promotion');
    grp.addQuery('topic', current.getUniqueValue());
    grp.query();
    if (grp.next()) {
        gs.addErrorMessage(gs.getMessage('Unable to deactivate topic: This topic is used in a custom chat experience. Please remove the topic from the chat experience to proceed.'));
        current.setAbortAction(true);
    }

})(current, previous);
