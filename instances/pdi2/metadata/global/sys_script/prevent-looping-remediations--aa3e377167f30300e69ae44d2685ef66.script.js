(function executeRule(current, previous /*null when async*/) {
	if(gs.getProperty('evt_mgmt.write_remediations_to_alert_work_notes', 'true') == 'true'){
		if ((current.automatic_execution_setting + "") === "2") { //If it's on any updates
			
			var remediations = new GlideRecord("em_alert_man_m2m_rule_workflow");
			remediations.addQuery("management_rule",current.sys_id);
			remediations.addActiveQuery();
			remediations.addQuery("executions_limit", ">", "1");
			remediations.query();
			if (remediations.hasNext()) { //found problematic remediations
				if ((previous.automatic_execution_setting +"") !== "2") {
					//Current change is change to any update- Aboart this change
					current.automatic_execution_setting = "1";
					
					gs.addErrorMessage(gs.getMessage("The 'Rule is activated when' setting of the rule was reset to 'Alert changes to filter' since there are remediation actions with an execution limit greater than 1. Change all remediations to execution limit = 1 or set the system property 'evt_mgmt.write_remediations_to_alert_work_notes' to false if you need to use the 'Alert matches filter' option."));
					
				} else { //the change was on the remediation tables, abort that change
					while (remediations.next()) {
						remediations.executions_limit = 1;
						remediations.update();
					}
					
					gs.addErrorMessage(gs.getMessage("All active remediation actions were automatically set to execution limit = 1. Set 'Rule is activated when' setting to 'Alert changes to filter' or change the system property 'evt_mgmt.write_remediations_to_alert_work_notes' to false if more than 1 execution is needed per alert."));
				}
			}
		}
	}
	
})(current, previous);
