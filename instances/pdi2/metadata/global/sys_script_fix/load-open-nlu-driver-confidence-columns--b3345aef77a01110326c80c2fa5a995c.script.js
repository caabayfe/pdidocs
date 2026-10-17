function updateOpenNLUDriverConfidenceThresholds() {
	var gr = new GlideRecord('sys_cs_general_settings');
	gr.query();

	if (gr.next()) {
		var providerSysId = gr.getValue('nlu_driver');
		var nluEnabled = gr.nlu_enabled.toString();
		var grOpenNluDriver = new GlideRecord('open_nlu_driver');
		grOpenNluDriver.query();

		var intentConfidenceThreshold = gs.getProperty('com.glide.cs.intent_confidence_threshold');
		var entityConfidenceThreshold = gs.getProperty('com.glide.cs.entity_confidence_threshold');
		var intentConfidenceDelta = gs.getProperty('com.glide.cs.intent_confidence_delta');

		while (grOpenNluDriver.next()) {
			if (grOpenNluDriver.getValue('sys_id') === providerSysId && nluEnabled === 'true') {
				// Copy original value from sys_properties to open_nlu_driver record where sys_id = providerSysId
				grOpenNluDriver.setValue('intent_confidence_threshold', intentConfidenceThreshold);
				grOpenNluDriver.setValue('entity_confidence_threshold', entityConfidenceThreshold);
				grOpenNluDriver.setValue('intent_confidence_delta', intentConfidenceDelta);
			} else {
				if (grOpenNluDriver.getValue('name') === 'ServiceNow NLU') {
					// For ServiceNowNLU inactive, set the default value which is 0.0/0.0/0.0
					grOpenNluDriver.setValue('intent_confidence_threshold', '0.0');
					grOpenNluDriver.setValue('entity_confidence_threshold', '0.0');
					grOpenNluDriver.setValue('intent_confidence_delta', '0.0');
				} else {
					// For all other providers, set the default value which is 0.7/0.5/0.1
					grOpenNluDriver.setValue('intent_confidence_threshold', '0.7');
					grOpenNluDriver.setValue('entity_confidence_threshold', '0.5');
					grOpenNluDriver.setValue('intent_confidence_delta', '0.1');
				}
			}
			grOpenNluDriver.update();
		}
	}
}

function overrideVAIntentThreshold() {
	//Override VA intent threshold only if NLU is enabled and Servicenow NLU is the NLU provider
	var ga = new GlideAggregate("sys_cs_general_settings");
	ga.addAggregate('COUNT');
	ga.addQuery("nlu_enabled", "true");
	ga.addQuery("nlu_driver", "64c023c17300330021a044764df6a70e");
	ga.query();
	if (ga.next() && ga.getAggregate('COUNT') > 0) {
		if (gs.getProperty("com.glide.cs.intent_confidence_threshold") == 0.7) {
			gs.info("Overriding VA intent confidence threshold as NLU provider is Servicenow NLU");
			gs.setProperty("com.glide.cs.intent_confidence_threshold", 0);
		}
		if (gs.getProperty("com.glide.cs.intent_confidence_delta") == 0.1) {
			gs.info("Overriding VA intent confidence delta as NLU provider is Servicenow NLU");
			gs.setProperty("com.glide.cs.intent_confidence_delta", 0);
		}
	}
	return;
}

var predecessorGr = new GlideRecord('sys_script_fix');
predecessorGr.addQuery('sys_id', '13fb390feb520110f4e8dc7ab5522851');
predecessorGr.query();
var alreadyRan = predecessorGr.next();
if (!alreadyRan)
	overrideVAIntentThreshold();

updateOpenNLUDriverConfidenceThresholds();
