function onSubmit() {
	if (!g_scratchpad.vaContent)
		return;
	
	var ga = new GlideAjax('VANotificationWarningUtil');
	ga.addParam('sysparm_name', 'showWarningIfUsersExceed');
	ga.addParam('fromAdditionalRecipient', g_form.getUniqueValue());
	ga.addParam('recordActive', g_form.getValue('active'));
	ga.addParam('recipients', g_form.getValue('recipients'));
	ga.addParam('condition', g_form.getValue('condition'));
	ga.addParam('recipientTable', g_form.getValue('recipient_table'));
	ga.addParam('notificationId', g_form.getValue('notification'));
	ga.getXML('callback');
}

function callback(response) {
	
}
