(function executeRule(current, previous /*null when async*/) {

	var txn = GlideTransaction.get();
	if (!txn)
		return;
	var request = txn.getRequest();
	if (!request)
		return;
	var referer = request.getHeader("Referer");
	if (GlideStringUtil.nil(referer))
		return;
	var isDirectInsert = (referer.indexOf("/interaction_related_record") >= 0);
	if (!isDirectInsert) {
		var interactionId = current.interaction;
		if (!interactionId || interactionId == -1) {
			gs.warn("Blocked insert of relationship because of invalid interaction id for " + current.document_table + ":" + current.document_id);
			current.setAbortAction(true);
			return;
		}
		var op = current.getValue('operation') != null ? current.getValue('operation') : "";
		if (!sn_interaction.RelatedRecord.isAutocreateAllowed(interactionId, current.document_table, current.document_id, op))
			current.setAbortAction(true);
	}

})(current, previous);
