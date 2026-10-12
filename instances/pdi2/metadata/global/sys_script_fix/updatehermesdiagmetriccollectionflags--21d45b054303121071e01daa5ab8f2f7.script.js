try {
	updateHermesDiagMetricsCollection();
} catch (e) {
	gs.log("updateHermesDiagMetricsCollection: " + e);
}

/**
 * Update existing hermes_app_services records associated to 'hermes-internal'
 * hermes-internal will have diagnostics/metrics enabled
 */
function updateHermesDiagMetricsCollection() {
	var diagMetricsGr = new GlideRecord("hermes_app_services");
	diagMetricsGr.addQuery("service_id", "bfe548804320311041a0e8625ab8f242");
	diagMetricsGr.query();
	while (diagMetricsGr.next()) {
		diagMetricsGr.setValue("recurring_diagnostics",true);
		diagMetricsGr.setValue("collect_metadata",true);
		diagMetricsGr.update();
	}
}
