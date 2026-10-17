(function() {
	return (current.email.getRefRecord().canDelete() && current.attachment.getRefRecord().canDelete());
})();
