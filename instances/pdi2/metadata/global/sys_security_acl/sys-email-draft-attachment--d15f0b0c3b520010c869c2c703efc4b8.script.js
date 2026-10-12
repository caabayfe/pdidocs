(function() {
	return current.email_draft.getRefRecord().canWrite() && current.attachment.getRefRecord().canRead();
})();
