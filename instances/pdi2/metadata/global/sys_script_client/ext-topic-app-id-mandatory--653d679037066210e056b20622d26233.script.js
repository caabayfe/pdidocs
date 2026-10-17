function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}
	checkExternalTopic(newValue);
}

function checkExternalTopic(namespaceValue) {
	// if namespace field was cleared reset the appID field
	if (!namespaceValue) {
		g_form.setMandatory("application_id", false);
		return;
	}

	// check if namespace is external (snc)
	var ga = new GlideAjax('HermesSysKafkaTopicAjax');
	ga.addParam('sysparm_name', 'isTopicExternal');
	ga.addParam('namespace', namespaceValue);
	ga.getXML(function(response) {
		var isExternal = response.responseXML.documentElement.getAttribute("answer");
		if (isExternal === "true") {
			enforceAppIdForExternalTopic();
		} else {
			g_form.setMandatory("application_id", false);
		}
	});
}

function enforceAppIdForExternalTopic() {
	var currentAppId = g_form.getValue("application_id");

	// Only make app ID mandatory if a hermes app service exists
	var ga = new GlideAjax('HermesSysKafkaTopicAjax');
	ga.addParam('sysparm_name', 'hasHermesAppServices');
	ga.getXML(hasHermesAppServicesCallback);

	function hasHermesAppServicesCallback(response) {
		var hasApps = response.responseXML.documentElement.getAttribute("answer");
		if (hasApps === "true") {
			g_form.setMandatory("application_id", true);
			if (!currentAppId) {
				defaultToSCIfInstalledAndNoAppIdSet();
			}
		}
	}
}

function defaultToSCIfInstalledAndNoAppIdSet() {
	var ga = new GlideAjax('HermesSysKafkaTopicAjax');
	ga.addParam('sysparm_name', 'isSCInstalled');
	ga.getXML(isSCInstalledCallback);

	function isSCInstalledCallback(response) {
	    // If no appID was selected while user attempting to an external topic, set default ot SC if installed.
		var scInstalled = response.responseXML.documentElement.getAttribute("answer");
		if (scInstalled === "true") {
			g_form.setValue("application_id", "fa2f3ad2430002102790827cfbb8f274");
		}
	}
}
