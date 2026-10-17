(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('quickactions_action');
	//sys_id for "Request Help" Quick Action = 234bd259b7ae00108766db98ee11a92a
    if (gr.get('234bd259b7ae00108766db98ee11a92a')) {
        if (current.agent_whisper && gr.active+''=='false') {
            gr.setValue('active', true);
			gr.update();
        } else if(!current.agent_whisper && gr.active+''=='true'){
            gr.setValue('active', false);
			gr.update();
        }
    }
})(current, previous);
