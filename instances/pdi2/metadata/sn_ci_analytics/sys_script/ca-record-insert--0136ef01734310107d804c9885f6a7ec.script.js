(function executeRule(current, previous /*null when async*/ ) {
    var record = new GlideRecord('sn_ci_analytics_conversation');
    var completedStates = gs.getProperty('sn_ci_analytics.analytic_conversation_completed_states', '');
    record.initialize();
    record.conversation = current.getValue('sys_id');
    record.consumer = current.consumer.sys_id;
    record.conversation_type = current.getValue('conversation_type');
    record.conversation_closed_at = current.conversation_completed;
    record.conversation_created_at = current.sys_created_on;
    record.status = 'new';
    record.conversation_state = completedStates.includes(current.state) ? 'completed' : 'open';
    record.sys_domain = current.sys_domain;
    record.insert();
})(current, previous);
