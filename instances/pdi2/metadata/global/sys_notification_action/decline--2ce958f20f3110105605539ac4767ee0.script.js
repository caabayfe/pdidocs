(function action(
		/*GlideRecord of sys_notification_execution*/ execution, 
		/*GlideRecord of sys_notification_action*/ action, 
		/*GlideRecord of sys_notification*/ notification, 
		/*GlideRecord of record changed to cause notification*/ target) {
	
	target.state = 'rejected';
	target.update();
	return 'Declined';
	
})(execution, action, notification, target);
