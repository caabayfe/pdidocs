function onBefore(current, previous) {
	var show = 0;
	var hide = 0;
	if (!current.notify_users_after_date.nil())
		show = current.notify_users_after_date.dateNumericValue();
	if (!current.notify_users_until_date.nil())
		hide = current.notify_users_until_date.dateNumericValue();
	
	if (show > hide) {
		gs.addErrorMessage(gs.getMessage('{0} must be before {1}',
										 [current.notify_users_after_date.getLabel(),
										  current.notify_users_until_date.getLabel()]));
		current.setAbortAction(true);
	}
}
