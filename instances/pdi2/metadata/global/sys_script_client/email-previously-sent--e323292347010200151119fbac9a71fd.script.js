function onLoad() {
	if(g_form.getValue('email_sent') == 'true') {
		g_form.addInfoMessage("Note: the email for this message has already sent. An update to the message or roles will only affect users at login");
	}	
}
