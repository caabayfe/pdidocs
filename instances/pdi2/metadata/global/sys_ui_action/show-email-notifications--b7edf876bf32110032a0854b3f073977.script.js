showEmailNotification();

function showEmailNotification() {
	var url = 'sysevent_email_action_list.do?sysparm_query=event_name%3Dpa.job.indicator.notification';
	action.setRedirectURL(url);
}
