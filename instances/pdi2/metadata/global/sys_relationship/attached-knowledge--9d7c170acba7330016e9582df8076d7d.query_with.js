(function refineQuery(current, parent) {
	var attachedKBIDs = [];
	var gr = new GlideRecord("m2m_kb_task");
	gr.addQuery("task",parent.sys_id);
	gr.query();
	var count = 0;
	while(gr.next())
		attachedKBIDs.push(gr.getValue("kb_knowledge"));
	
	current.addQuery('sys_id', 'IN', attachedKBIDs.join());
})(current, parent);
