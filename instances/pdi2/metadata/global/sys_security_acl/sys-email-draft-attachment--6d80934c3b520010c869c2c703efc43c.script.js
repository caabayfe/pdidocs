(function() {
	return current.email_draft.getRefRecord().canRead() && current.attachment.getRefRecord().canRead();
})();
