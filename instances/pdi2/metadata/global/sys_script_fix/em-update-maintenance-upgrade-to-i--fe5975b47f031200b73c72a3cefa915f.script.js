
var impactManager = new SNC.ImpactManager();
impactManager.updateMilisecondsForMaintTableFixSciprt();


if (gs.getProperty('evt_mgmt.impact_maintenance.use_change_request', true) == 0 ||
    gs.getProperty('evt_mgmt.impact_maintenance.use_change_request', true) == 'false') {
	var gr = new GlideRecord('em_maintenance_rule');
	if (gr.get('4ec1d5b093c312005bc5f179077ffbf0')) {
		gr.active = '0';
		gr.update();
   }
}

if (gs.getProperty('evt_mgmt.impact_maintenance.use_cmdb_status', true) == 0 ||
    gs.getProperty('evt_mgmt.impact_maintenance.use_cmdb_status', true) == 'false') {
	var gr = new GlideRecord('em_maintenance_rule');
	if (gr.get('ae4195b093c312005bc5f179077ffbff')) {
		gr.active = '0';
		gr.update();
   }
}

var maintSleep = gs.getProperty("evt_mgmt.impact_maintenance.sleep_time_sec", 60);
if (maintSleep != '60') {
	var gr = new GlideRecord('sysauto');
	if (gr.get('5fa0a9b2930312005bc5f179077ffb11')) {
		var period = new GlideDuration(1000*maintSleep);
		gr.setValue('run_period', period.getValue());
		gr.update();
	}
}
