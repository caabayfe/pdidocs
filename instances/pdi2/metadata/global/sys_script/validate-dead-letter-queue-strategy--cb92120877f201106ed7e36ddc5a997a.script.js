(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideAggregate('sys_nowmq_subject_param');
	gr.addQuery('name', 'dead_letter_queue');
	gr.addQuery('subject', current.subject);
	
	// dead-letter-queue not configured, abort action
	if (gr.getCount() == 0) {
		gs.addErrorMessage(gs.getMessage("In order to use the DEAD_LETTER retry strategy, you must first configure the dead_letter_queue parameter to an existing queue."));
		current.setAbortAction(true);
	}
})(current, previous);
