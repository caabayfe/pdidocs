gs.info("Starting update of the OpenNLUPredictIntentFeedback table to populate the NLU Discovery Outcome field");
try {
	var api = new UpdateNLUDiscoveryOutcomes();
	api.updateNluDiscoveryOutcomes();
} catch (ex) {
	gs.info("Error running updateNluDiscoveryOutcomes() : " + ex.toString());
}

// Set this record to false so that it does not run again
var gr = new GlideRecord("sysevent_script_action");
gr.addQuery("sys_id", "d28b5c06eb463010506f7558b552281f"); // Sysid of this record
gr.query();
if (gr.next()) {
	gr.setValue("active", false);
	gr.update();
}

gs.info("Completed update of the OpenNLUPredictIntentFeedback table");
