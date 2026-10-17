var relDoc = new GlideRecord('cxs_relevant_doc');
relDoc.addQuery('source_doc', current.task);
relDoc.query();

if (relDoc.next()) {
    var relDocDetail = new GlideRecord('cxs_rel_doc_detail');
    relDocDetail.addQuery('cxs_relevant_doc', relDoc.getUniqueValue());
    relDocDetail.addQuery('relevant_doc', current.kb_knowledge);
    relDocDetail.addQuery('relevance', 'attach');
    relDocDetail.query();

    if (relDocDetail.next()) {
		relDocDetail.sysAutoFields(false);
		relDocDetail.setWorkflow(false);
        relDocDetail.deleteRecord();
    }
}
