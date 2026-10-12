(function executeRule(current, previous /*null when async*/) {
	if (!current['controlled_by_refs'].nil() && (current['name'].includes('.'))) {
		gs.addErrorMessage(gs.getMessage("Field level specifications are not allowed. This ACL is configured to be controlled by references."));
		current.setAbortAction(true);
	}
})(current, previous);
