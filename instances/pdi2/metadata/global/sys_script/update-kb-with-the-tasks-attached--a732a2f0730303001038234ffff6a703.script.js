(function executeRule(current, previous /*null when async*/) {
		var detailsGr = new GlideRecord('cxs_rel_doc_detail');
		detailsGr.addQuery('cxs_relevant_doc', current.sys_id);
		detailsGr.addQuery('relevance', 'attach');
		detailsGr.query();
		while(detailsGr.next()) {
			//Create records for all the 'attach' actions happened before submit of the record
			var kbTask = new GlideRecord('m2m_kb_task');
			kbTask.addQuery("kb_knowledge", detailsGr.relevant_doc);
			kbTask.addQuery("task", current.source_doc);
			kbTask.query();
			if (!kbTask.next()) {
				var kbScript = new KnowledgeAjax();
				kbScript.kbAttachArticle(detailsGr.relevant_doc + "," + detailsGr.cxs_relevant_doc.source_doc, detailsGr.relevant_doc_url);
			}
		}
})(current, previous);
