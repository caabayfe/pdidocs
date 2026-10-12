try {
	updateDefaults();
} catch (e) {
	gs.error(e.toString());
}

function updateDefaults() {
	gs.info("running fix script: HermesUpdateDefaultForDiag - 3804cefa4f00221071e0a0e552ce0bb7");
	updateCollectMetadata();
	updateRecurringDiag();
}

function updateCollectMetadata() {
	var grDict = new GlideRecord("sys_dictionary");
	grDict.addEncodedQuery("GOTOname=hermes_app_services^default_value=true^element=collect_metadata");
	grDict.setLimit(1);
	grDict.query();
	if(grDict.next()) {
		gs.info("Found collect_metadata and updating");
		grDict.setValue("default_value", false);
		grDict.update();
	} 
}

function updateRecurringDiag() {
	var grDict = new GlideRecord("sys_dictionary");
	grDict.addEncodedQuery("GOTOname=hermes_app_services^default_value=true^element=recurring_diagnostics");
	grDict.setLimit(1);
	grDict.query();
	if(grDict.next()) {
		gs.info("Found recurring_diagnostics and updating");
		grDict.setValue("default_value", false);
		grDict.update();
	}
}
