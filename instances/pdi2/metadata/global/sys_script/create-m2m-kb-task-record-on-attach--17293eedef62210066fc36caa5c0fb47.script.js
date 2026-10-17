(function executeRule(current, previous /*null when async*/) {
	if (current.cxs_relevant_doc.source_doc) { // for existing records
		var kbScript = new KnowledgeAjax();
		kbScript.kbAttachArticle(current.relevant_doc + "," + current.cxs_relevant_doc.source_doc,current.relevant_doc_url);
	}
})(current, previous);
