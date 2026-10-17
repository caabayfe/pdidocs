function onSubmit() {
	if (!g_scratchpad.vaContent)
		return;
	
	var recipientUsers = g_form.getValue('recipient_users');
	var recipientUsersCount = recipientUsers ? recipientUsers.split(',').length : 0;
	var recipientFields = g_form.getValue('recipient_fields');
	var recipientFieldsCount = recipientFields ? recipientFields.split(',').length : 0;

	var sysUserCount = recipientUsersCount + recipientFieldsCount;
	
	var ga = new GlideAjax('VANotificationWarningUtil');
	ga.addParam('sysparm_name', 'showWarningIfUsersExceed');
	ga.addParam('sysUserCount', sysUserCount);
	ga.addParam('notificationId', g_form.getUniqueValue());
	ga.addParam('notificationName', g_form.getValue('name'));
	ga.getXML('callback');
}

function callback(response) {
	
}
