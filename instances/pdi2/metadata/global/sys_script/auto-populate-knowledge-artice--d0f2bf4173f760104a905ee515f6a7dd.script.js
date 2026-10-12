(function executeRule(current, previous /*null when async*/ ) {
	current.type = "knowledge";
	current.knowledge_article = current.document_id;
	if (GlideStringUtil.nil(current.getValue("operation")))
		current.operation = "Viewed";
})(current, previous);
