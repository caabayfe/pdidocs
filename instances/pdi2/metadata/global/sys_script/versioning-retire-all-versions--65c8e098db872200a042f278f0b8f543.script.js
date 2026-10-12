(function executeRule(current, previous /*null when async*/) {
	
	if(current.article_id.nil())
		return;
	
	var gr = new GlideRecord('kb_knowledge');
	gr.setWorkflow(false);
	gr.addQuery('article_id',current.article_id);
	gr.addQuery('sys_id','!=',current.sys_id+'');
	gr.query();
	while(gr.next()){
		gr.workflow_state = 'retired';
		gr.update();
	}

})(current, previous);
