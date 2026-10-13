var message;
var result = SNC.MetricScriptableApis.setupOperationalIntelligence(current.getUniqueValue());
if (result && result != '') {
	if (result.contains("Error")) {
		gs.addErrorMessage(result);
		// Stay in the form
		action.setReturnURL(current);
		action.setRedirectURL(current);
	}
	else {
		var opExtGr = new GlideRecord('ecc_agent_ext_context_metric');
		if (!opExtGr.get(result)) {
			message = gs.getMessage("Failed to get the extension sys id");
			gs.addErrorMessage(message);
			// Stay in the form
			action.setReturnURL(current);
			action.setRedirectURL(current);
		}
		else {
			var opExtStatus = opExtGr.status;
			var statusCheck = (opExtStatus == 'Started' || (opExtStatus == 'Warning' && currentErrorMessage == 'Warning: Could not start rest api because web server is not running.') || (opExtStatus == 'Warning' && currentErrorMessage == 'Warning: Rest api is not available because web server is shutdown.'));
			if (!statusCheck) {
				var opExtContext = new MIDExtensionContext(opExtGr);
				opExtContext.start();
			}
			message = gs.getMessage("MI Setup has created an Metric Intelligence Extension. Wait a few minutes and verify the status has changed to 'Started'");
			gs.addInfoMessage(message);
			action.setRedirectURL(opExtGr);	
		}
	}
}
