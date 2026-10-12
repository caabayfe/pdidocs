function onLoad() {
   // Show a servicenow configuration message if ServiceNow configured this email account
   var snConfigured = g_form.getValue("servicenow_configured");
   if (snConfigured == "true") {
	   var restrictedMsg = g_scratchpad.serviceNowConfiguredStr + '  ';
	   var moreInfo = g_scratchpad.moreInfoStr;
      g_form.addInfoMessage(restrictedMsg + '<a href="http://docs.servicenow.com/?context=ServiceNow_Email_Account" target="_blank"> ' + moreInfo + '</a>');
   }
}
