(function executeRule(current, previous /*null when async*/ ) {
    try {
        var inputs = {};
        inputs['sidebar_chat_sys_id'] = current.getValue('collab_chat');
        inputs['record_sys_id'] = current.getValue('document');
        inputs['record_table'] = 'incident';
        sn_fd.FlowAPI.getRunner().subflow('sn_sow_collab.sidebar_discussion_creation').inBackground().withInputs(inputs).run();
    } catch (ex) {
        var message = ex.getMessage();
        gs.error(message);
    }
})(current, previous);
