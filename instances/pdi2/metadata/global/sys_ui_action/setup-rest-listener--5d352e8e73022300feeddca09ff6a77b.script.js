var opExtStatus = current.status;
var currentErrorMessage = current.error_message;

// Only do the Web Server Setup if Status is Started or Warning with specified message
if (opExtStatus == 'Started' || (opExtStatus == 'Warning' && currentErrorMessage == 'Warning: Could not start rest api because web server is not running.') || (opExtStatus == 'Warning' && currentErrorMessage == 'Warning: Rest api is not available because web server is shutdown.')) {
	var webExtSysId = SNC.MetricScriptableApis.setupOIRestListener(current.getUniqueValue(), current.mid_server);
	var message;
	if (webExtSysId && webExtSysId != "") {
		var webExtGr = new GlideRecord('ecc_agent_ext_context_webserver');
		webExtGr.get(webExtSysId);
		var webServerStatus = webExtGr.status;
		var isWebServerUp = webServerStatus && (webServerStatus == 'Started' || webServerStatus == 'Starting');
		
		if (!isWebServerUp) {
			var webExtContext = new MIDExtensionContext(webExtGr);
			webExtContext.start();
		}

		current.enable_rest_listener = true;
		current.web_ext = webExtSysId;
		current.update();

		// If the MID Web Server extension wasn't started, restart the operational metric extension, otherwise just do update parameters
		var context = new MIDExtensionContext(current);
		if (isWebServerUp)
			context.updateParameters();
		else
			context.restart();
		message = gs.getMessage("OI Setup has created a Mid Web Server Extension. Wait a few minutes and verify the status has changed to 'Started'");
		gs.addInfoMessage(message);
	}
	else {
		message = gs.getMessage("Failed to create Web Server extension.");
		gs.addErrorMessage(message);
	}
}
else {
	var message = gs.getMessage("Cannot setup Web Extension if current extension is not Started");
	gs.addInfoMessage(message);
}
// Stay in the form
action.setReturnURL(current);
action.setRedirectURL(current);
