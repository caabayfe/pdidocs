//Limit the number of user-defined megaphone messages that can be active at once

(function executeRule(current, previous /*undefined when async or display*/) {
	if(current.email_sent.changesTo(true))
		return;
	
	if(current.isNewRecord() || current.notify_users_after_date.changes() || current.notify_users_until_date.changes()) {
		var totalOverlap = 0;
		var startsBefore = new GlideAggregate('sys_broadcast_message');
		startsBefore.addQuery('sys_id', "!=", current.sys_id);
		startsBefore.addQuery('notify_users_after_date', "<=", current.notify_users_after_date);
		startsBefore.addQuery('notify_users_until_date', ">=", current.notify_users_after_date);
		startsBefore.addAggregate('COUNT');
		startsBefore.query();
		if(startsBefore.next())
			totalOverlap += parseInt(startsBefore.getAggregate('COUNT'));
		
		var startsDuring = new GlideAggregate('sys_broadcast_message');
		startsDuring.addQuery('sys_id', "!=", current.sys_id);
		startsDuring.addQuery('notify_users_after_date', ">", current.notify_users_after_date);
		startsDuring.addQuery('notify_users_after_date', "<=", current.notify_users_until_date);
		startsDuring.addAggregate('COUNT');
		startsDuring.query();
		if(startsDuring.next())
			totalOverlap += parseInt(startsDuring.getAggregate('COUNT'));
		
		var maxMessages = gs.getProperty('glide.megaphone.max.messages', 10);
		if(totalOverlap >= maxMessages) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("Maximum number of active messages in that time span exceeded."));
		}
	}
})(current, typeof previous != 'undefined' ?  previous : null);
