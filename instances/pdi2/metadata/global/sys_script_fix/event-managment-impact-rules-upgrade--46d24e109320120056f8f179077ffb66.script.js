var impactManager = new SNC.ImpactManager();
impactManager.initMaintHash();

var runImport = true;

var jobs = new GlideRecord('sysauto_script');
jobs.addQuery("name", "Event Management -Import impact rules");
jobs.query();
if (jobs.next()) {
	gs.log('No need to initalize impact rules on EM plugin activation, since the impact rules omport job exists');
	runImport = false;
}

var grProp = new GlideRecord("sys_properties");
grProp.addQuery("name", "evt_mgmt.dont_import_rules_by_job");
grProp.query();

while (grProp.next()) {
	if (grProp.getValue("name") == 'evt_mgmt.dont_import_rules_by_job') {
		if (grProp.getValue("value") === "true") {
			gs.log('No need to initalize impact rules on EM plugin activation, since the dont_import_rules_by_job flag exists');
			runImport = false;
		}
	}
}

if (runImport) {
	gs.log('Running Initialize impact rules on EM plugin activation');

	var gr = new GlideRecord('cmdb_ci_service_discovered');
	if (gr.isValid()) {
		gr.query();
		while (gr.next()) {
			var bsId = gr.getUniqueValue();
			gs.log('Initialize impact rules for business service: ' + bsId);
			impactManager.initImpactRulesWhileEmActivated(gr.getUniqueValue());
		}
	}
	
	gs.log('Finished Running Initialize impact rules on EM plugin activation');
}
