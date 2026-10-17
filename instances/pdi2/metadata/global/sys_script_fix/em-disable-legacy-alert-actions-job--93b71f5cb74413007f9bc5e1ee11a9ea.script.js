gs.log("Run 'EM - Disable legacy Alert Action job' fix script. Update legacy alert action job to non-active");

var EM_create_resolved_incidents = "fdab0713eb1211004d7763fba206fefc";
var EM_create_resolved_incidents_Trigger1 = "Event Management - resolved incidents cl";
var EM_create_resolved_incidents_Trigger2 = "Event Management - create/resolved incid";

var EMjobs = [EM_create_resolved_incidents];

var gr = new GlideRecord("sysauto");
gr.addQuery("sys_id", "IN", EMjobs);
gr.query();
while (gr.next()) {
	gr.setValue("active", false);	
	gr.update();
}

//need also to delete the trigger itself since disabling doesn't handle the trigger on upgrades
gr = new GlideRecord("sys_trigger");
var qc = gr.addQuery("name", "CONTAINS", EM_create_resolved_incidents_Trigger1);
qc.addOrCondition("name", "CONTAINS", EM_create_resolved_incidents_Trigger2);
gr.query();
while (gr.next()) {
	gr.deleteRecord();
}


//Disable legacy alert action rules processing where there are no legacy rules
if (gs.getProperty('evt_mgmt.alert.management.enable_legacy_alert_action_rules','true') == 'true') {
	gr = new GlideRecord("em_alert_rule");
	gr.addActiveQuery();
	gr.query();
	if (!gr.next()) {
		gs.setProperty('evt_mgmt.alert.management.enable_legacy_alert_action_rules','false');
		gs.log("Disabling legacy alert action rules processing since there are no active alert action rules (evt_mgmt.alert.management.enable_legacy_alert_action_rules = false)");
		//disable old business rules		
		var EM_run_automatic_remediation_actions_id = "d5ca862c37433100ddf3cc028e41f113";
		var EM_apply_overwrite_rule_and_validate_id = "a7719840eb3211006a668c505206fe88";
		var EM_legacy_rule_ids = [EM_run_automatic_remediation_actions_id, EM_apply_overwrite_rule_and_validate_id];
		var sysScriptGr = new GlideRecord("sys_script");
		sysScriptGr.addQuery("sys_id", "IN", EM_legacy_rule_ids);
		sysScriptGr.addActiveQuery();
		sysScriptGr.query();
		while (sysScriptGr.next()) {
			sysScriptGr.setValue("active", false);
			if (!sysScriptGr.name.startsWith("Legacy"))
			  sysScriptGr.setValue("name", "Legacy " + sysScriptGr.name);	
			sysScriptGr.update();
			gs.log("Disabling '" + sysScriptGr.name + "' business rule since there are no active Alert Action Rules");
		}
	}
	gr = new GlideRecord("em_alert_rule");
	gr.query();
	if (!gr.next()) {
		//disable Alert Rules menu item if no alert action rules exist
		sysAppGr = new GlideRecord("sys_app_module");
		sysAppGr.addQuery("sys_id", "IN", "1fff82ea934231000fb3b9ab357ffbf5");//'Alert Action Rules' menu action sys_id
		sysAppGr.AddActiveQuery();
		sysAppGr.query();
		while (sysAppGr.next()) {
		  sysAppGr.setValue("active", false);
		  sysAppGr.update();
		  gs.log("Disabling '" + sysAppGr.sys_name + "' menu item since there are no Alert Action Rules");
		}
	}
}


gs.log("Finish Run 'EM - Disable legacy Alert Actions job' fix script. Update legacy alert action job to non-active");
