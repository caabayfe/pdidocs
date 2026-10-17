(function executeRule(current, previous /*null when async*/) {
   // This function loads all the needed strings and properties up front
   // to give a better user experience

   g_scratchpad.glideEmailReadActive = gs.getProperty("glide.email.read.active");
   g_scratchpad.glideEmailSmtpActive =	gs.getProperty("glide.email.smtp.active");
   g_scratchpad.glideEmailAccountEnableKeystoreSelection = gs.getProperty("glide.notification.use_dbkeystore_socket_factory.all.certs", "true") == "true" ? false : true;

   g_scratchpad.moreInfoStr = gs.getMessage('more info');
   g_scratchpad.emailPropertiesStr = gs.getMessage('Email Properties');
   g_scratchpad.sendDisabledMessageStr = gs.getMessage('Email sending property is disabled. You must enable it to send email.');
   g_scratchpad.receiveDisabledMessageStr = gs.getMessage('Email receiving property is disabled. You must enable it to receive email.');
   g_scratchpad.serviceNowConfiguredStr = gs.getMessage('This account is configured and maintained by ServiceNow.');
})(current, previous);
