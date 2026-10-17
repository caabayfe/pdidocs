(function executeRule(current, previous /*null when async*/) {
	// same subject, abort
	if (current.subject.subject_name == current.value) {
		gs.addErrorMessage(gs.getMessage("Subject cannot be its own dead-letter queue subject."));
		current.setAbortAction(true);
		return;
	}

	var dlq = new GlideAggregate('sys_nowmq_subject');
	dlq.addQuery('subject_name', current.value);
	// subject doesn't exist, abort
	if (dlq.getCount() == 0) {
		gs.addErrorMessage(gs.getMessage("Dead-letter queue subject doesn't exist."));
		current.setAbortAction(true);
	}

})(current, previous);
