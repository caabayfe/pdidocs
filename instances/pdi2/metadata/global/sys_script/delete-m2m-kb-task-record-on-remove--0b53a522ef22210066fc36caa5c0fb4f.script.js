var kbTask = new GlideRecord('m2m_kb_task');
kbTask.addQuery("kb_knowledge",current.relevant_doc);
kbTask.addQuery("task",current.cxs_relevant_doc.source_doc);
kbTask.query();
	
if (kbTask.next()) {
	kbTask.deleteRecord();
}
