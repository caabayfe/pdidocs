function onLoad() {
	var name = 'notification_no_content';

	if (g_form.isNewRecord()) {
		return true;
	}

	var content = new GlideRecord('sys_notification_content');
	content.addQuery('notification', g_form.getUniqueValue());
	content.query(contentResponse);
}

function contentResponse(content) {
	if (content.hasNext())
		return;

	g_form.addErrorMessage(getMessage('No content is associated to your notification.  Please add content using the \'Notification Contents\' related list below.', name));
}
