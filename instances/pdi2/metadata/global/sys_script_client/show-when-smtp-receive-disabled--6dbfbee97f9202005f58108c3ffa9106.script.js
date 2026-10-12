function displayMessageAndLinkToPropsPage(message) {
   var emailPropertiesStr = g_scratchpad.emailPropertiesStr;
   var aHrefOpen = '<a href="email_properties.do">';
   var aHrefClose = '</a>';
	
   g_form.addInfoMessage(message + ' &nbsp;&nbsp;' + aHrefOpen + emailPropertiesStr + aHrefClose);
}

function onChange(control, oldValue, newValue, isLoading, isTemplate) {

   // Remove the the previous messages shown by this client script before
   // showing any new ones (Also, don't clear on initial load, as the
   // ServiceNowConfigured client script display would be overwritten)
   if (!isLoading) {
	   g_form.clearMessages();
   }
	
   if (g_scratchpad.glideEmailSmtpActive != 'true' && g_form.getValue("type") == 'smtp') {
       // The smtp account property is disabled yet the email account is smtp
	   // Warn the user that sending can't occur until the property is enabled
	   displayMessageAndLinkToPropsPage(g_scratchpad.sendDisabledMessageStr);
	   
   } else if (g_scratchpad.glideEmailReadActive != 'true' && g_form.getValue("type") != 'smtp') {
       // The receive account property is disabled yet the email account is pop3 or imap
	   // Warn the user that receiving can't occur until the property is enabled
	   displayMessageAndLinkToPropsPage(g_scratchpad.receiveDisabledMessageStr);
   }

}
