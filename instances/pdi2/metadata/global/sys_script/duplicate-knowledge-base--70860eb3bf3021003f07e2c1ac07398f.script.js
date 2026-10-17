var knowledgeBase = new GlideRecord('kb_knowledge_base');
knowledgeBase.addQuery('title', current.title);
knowledgeBase.addQuery('sys_id', '!=', current.getUniqueValue());
knowledgeBase.query();

if(knowledgeBase.getRowCount() > 0) {
	gs.addInfoMessage(gs.getMessage('A knowledge base called \'{0}\' already exists', [current.title]));
	current.setAbortAction(true);
}
