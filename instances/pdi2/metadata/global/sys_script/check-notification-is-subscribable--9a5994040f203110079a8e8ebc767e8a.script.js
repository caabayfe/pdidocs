(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('sysevent_email_action');
	gr.addQuery("sys_id", current.notification);
	gr.query();
	if (gr.next() && (gr.active!=true || gr.subscribable!=true)) {
		gs.addErrorMessage(gs.getMessage("Subscription record cannot be created or updated for inactive or Non-Subscribable Notification"));
		current.setAbortAction(true);
	}

})(current, previous);
