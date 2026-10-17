function onAfter(current, previous) {
	if (current.operation() != 'update' || current.state == previous.state) {
		// Search indexing directly handles attachments incrementally, so skip re-indexing the frobbed parent record
		var updateTextSuppressed = gs.suppressTextIndex(true);
		try {
			new AttachmentAuditTrailHelper(current).recordUpdateOnParent();
		} finally {
			gs.suppressTextIndex(updateTextSuppressed);
		}
	}
}
