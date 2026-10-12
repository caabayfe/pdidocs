(function executeRule(current, previous /*null when async*/) {
	if (current.operation() == "insert" || (current.operation() == "update" && (current.sc_cat_item != previous.sc_cat_item))) {
		var aisaUtil = new AISARecordProducerUtils();
		if (aisaUtil.checkForDuplicateRPC(current)) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("An AISA Record Producer Configuration already exists for this record producer"));
		}
	}
})(current, previous);
