(function executeRule(current, previous /*null when async*/) {

	// Make sure the latest version available after this version is deleted has the latest flag set to true
	
	if(current.article_id.nil())
		return;
	
	var gr = new GlideRecord('kb_knowledge');
	gr.setWorkflow(false);
	gr.orderByDesc('sys_created_on');
	gr.addQuery('article_id',current.article_id);
	gr.addQuery('sys_id','!=',current.sys_id);
	gr.query();
	if(gr.next() && gr.workflow_state!='outdated'){
		gr.latest = true;
		gr.setWorkflow(false);
		gr.autoSysFields(false);
		gr.update();
	}
	

})(current, previous);
