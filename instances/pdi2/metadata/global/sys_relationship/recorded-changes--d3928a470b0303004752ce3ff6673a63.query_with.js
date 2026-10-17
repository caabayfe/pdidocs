(function refineQuery(current, parent) {
	current.addQuery("context", parent.delete_recovery.rollback_context);
	current.addQuery("txn_id", parent.action_id);
 	current.addQuery("document_id", parent.document_id);
})(current, parent);
