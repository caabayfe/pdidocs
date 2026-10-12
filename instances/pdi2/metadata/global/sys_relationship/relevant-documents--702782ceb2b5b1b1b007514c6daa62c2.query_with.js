current.addQuery('doc_source_doc_table', parent.getRecordClassName());
current.addQuery('doc_source_doc', parent.sys_id);
current.addQuery('detail_relevance', "!=", 'attach');
current.addQuery('detail_relevant_doc_table', 'kb_knowledge');
