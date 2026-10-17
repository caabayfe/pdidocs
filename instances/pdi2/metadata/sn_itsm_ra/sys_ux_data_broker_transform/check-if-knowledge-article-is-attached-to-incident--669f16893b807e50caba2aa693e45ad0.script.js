function transform(input) {
  if (!input || !input.knowledgeId || !input.taskId)
    return false;
  var m2mKbTask = new GlideRecord("m2m_kb_task");
	m2mKbTask.addQuery("kb_knowledge", input.knowledgeId);
	m2mKbTask.addQuery("task", input.taskId);
	m2mKbTask.setLimit(1);
	m2mKbTask.query();
	return m2mKbTask.next();
}
