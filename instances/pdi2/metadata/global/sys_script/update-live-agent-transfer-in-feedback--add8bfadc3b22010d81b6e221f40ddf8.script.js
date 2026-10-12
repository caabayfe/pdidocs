(function executeRule(current, previous /*null when async*/ ) {
	var state = previous.getValue('state');
	if (state === 'canceled' || state === 'completed' || state === 'faulted') {
        return;
    }
    var genSettings = new GlideRecord('sys_cs_general_settings');
    genSettings.addQuery('sys_domain', 'global');
    genSettings.query();
    if (genSettings.next()) {
        if (genSettings.getValue('nlu_enabled') === '0') {
            return;
        }
    }

    var gr = new GlideRecord('open_nlu_predict_feedback');
    gr.addJoinQuery('sys_cs_conversation_task', 'app_document', 'sys_id').addCondition('conversation', current.getValue('sys_id'));
    gr.addQuery('app_document_table', 'sys_cs_conversation_task');
    gr.query();

    while (gr.next()) {
        if (gr.getValue('mapped') === '0' || (gr.getValue('shown') === '0' && gr.getValue('auto_selected') === '0') || (gr.getValue('selected') === '0' && gr.getValue('auto_selected') === '0') || (gr.getValue('auto_selected') === '1' && gr.getValue('user_confirmation') === 'No')) {
            if (current.getValue('live_agent_transfer_time')) {
                gr.setValue('skipped', 'Yes');
            } else {
                gr.setValue('skipped', 'No');
            }
            gr.update();
        }
    }
})(current, previous);
