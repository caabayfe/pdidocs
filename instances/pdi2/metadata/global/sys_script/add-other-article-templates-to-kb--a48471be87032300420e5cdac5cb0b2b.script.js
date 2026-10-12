(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	new ArticleTemplateUtil().checkAndAddTemplates(current.getValue('kb_knowledge_base'), current.kb_article_template.child_table);
	
})(current, previous);
