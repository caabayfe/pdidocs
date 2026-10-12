(function() {
	return current.email_draft.getRefRecord().canCreate() && current.attachment.getRefRecord().canRead();
})();
