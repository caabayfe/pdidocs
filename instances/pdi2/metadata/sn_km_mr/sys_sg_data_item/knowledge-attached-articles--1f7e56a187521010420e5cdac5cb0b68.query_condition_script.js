(function getQueryString(input) {
	var task = new GlideRecord('task');
	if(!task.get(input.task_id))
		return;

	var gr = new GlideRecord("m2m_kb_task");
	gr.addQuery("task", input.task_id);
	gr.query();

	var attachedKBIDs = [];
	while(gr.next())
		attachedKBIDs.push(gr.getValue("kb_knowledge"));
	return 'sys_idIN' + new global.KBViewModel().getLatestArticles(attachedKBIDs, true).join();
})(input);
