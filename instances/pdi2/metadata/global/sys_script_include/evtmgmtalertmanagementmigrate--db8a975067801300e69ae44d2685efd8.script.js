gs.include('EvtMgmtCommons');

var EvtMgmtAlertManagementMigrate = Class.create();

EvtMgmtAlertManagementMigrate.prototype = {
	initialize: function() {
		this.evtMgmtCommons  = new EvtMgmtCommons(); 

		this.AUTOMATIC_EXECUTION="1";
		this.MANUAL_EXECUTION="2";
		this.BOTH_EXECUTION="3";
		this.SUBFLOW_TABLE = "em_alert_man_m2m_rule_flow";
		this.WORKFLOW_TABLE = "em_alert_man_m2m_rule_workflow";
		this.LAUNCHER_TABLE = "em_launch_application";
		
		// sub-flows sys ids 
		this.TASK_SUBFLOW_SYS_ID = "4bccb5cd678413001e44007d2685ef57"; 
		this.ALERT_TEMPLATE_SUBFLOW_SYS_ID = "b239dec967c413001e44007d2685ef26"; 
		this.KB_SUBFLOW_SYS_ID = "81a1c75b674013001e44007d2685ef99";
		this.ACKNOWLEDGE_SUBFLOW_SYS_ID = "b1e21924937b0300415c74aff67ffb7c";
		
		// old business rule ids
		this.EM_RUN_AUTOMATIC_REMEDIATION_ACTIONS_ID = "d5ca862c37433100ddf3cc028e41f113";
        this.EM_APPLY_OVERWRITE_RULE_AND_VALIDATE_ID = "a7719840eb3211006a668c505206fe88";

	},
	
	type: 'EvtMgmtAlertManagementMigrate',
	
	migrateRule: function(oldRuleGR) {
		gs.log("Migrating old alert action rule: " + oldRuleGR.name);
		if (this.isAlreadyMigrated(oldRuleGR))
			return false;
		
		// check user domain vs. old rule domain. Don't allow to migrate rule from different domain
		var sessionDomain = this.evtMgmtCommons.getCurrentDomainID();
		var ruleDomain = oldRuleGR.sys_domain;
		ruleDomain = this.evtMgmtCommons.returnGlobaDomainForEmpty(ruleDomain) + "";

		if (sessionDomain != ruleDomain) {
			gs.addErrorMessage(gs.getMessage("Can't migrate the rule '{0}' since rule domain is different from user domain.", [oldRuleGR.name]));
			return false;
		}
		if(oldRuleGR.alert_filter.indexOf('MATCH_RGX')>-1){
			gs.addInfoMessage(gs.getMessage("When migrating the rule '{0}' which contains the RegEx filter: '{1}', the RegEx filter is displayed as a blank field on the Alert Management UI. However, the migrated rule works as expected.",[oldRuleGR.name,oldRuleGR.alert_filter]));
		}
		// create new AM rule
		newRuleGR = new GlideRecord("em_alert_management_rule");
		newRuleGR.setValue("name", oldRuleGR.name);
		newRuleGR.setValue("active", false);
		newRuleGR.setValue("order", oldRuleGR.order);
		newRuleGR.setValue("alert_filter", oldRuleGR.alert_filter);
		newRuleGR.setValue("migrated_from", oldRuleGR.sys_id);
		newRuleGR.description = gs.getMessage("Rule migrated from alert action rule '{0}'.", [oldRuleGR.name]);
		newRuleGR.automatic_execution_setting = 2;
		var newRuleSysId = newRuleGR.insert();		
		
		// Migrate basic actions
		var actionSysId = this.processTaskFields(oldRuleGR, newRuleGR);
		actionSysId = this.processAlertTemplate(oldRuleGR, newRuleGR);
		actionSysId = this.processAutoAcknowledge(oldRuleGR, newRuleGR);
		actionSysId = this.processKB(oldRuleGR, newRuleGR);
		
		// Migrate remediation
		actionSysId = this.processRemediation(oldRuleGR, newRuleGR);
		
		// Migrate launcher
		actionSysId = this.processLauncher(oldRuleGR, newRuleGR);
		
		
		// activate the new AM rule if the old rule was active
		newRuleGR.setValue("active", oldRuleGR.active);
		// always deactivate the old rule
		oldRuleGR.setValue("active", false);
		newRuleGR.update();
		oldRuleGR.update();
		
		this.cleanUp();
				
		var link = '<a target="_blank" href="/nav_to.do?uri=em_alert_management_rule.do?sys_id=' + newRuleGR.sys_id + '">' + newRuleGR.name + '</a>';
		gs.addInfoMessage(gs.getMessage("Rule '{0}' migrated successfully to the new Alert Management rule '{1}'.", [oldRuleGR.name, link]));		
	},
	
	isAlreadyMigrated: function(oldRuleGR) {
		// check if this rule was already migrated
		var newRuleGR = new GlideRecord("em_alert_management_rule");
		newRuleGR.addQuery('migrated_from', oldRuleGR.sys_id);
		newRuleGR.query();
		if (newRuleGR.next()) {
			var msg =  "Trying to migrate already migrated alert action rule. Old rule name: " + oldRuleGR.name + ", New rule name: " + newRuleGR.name;
			var link = '<a target="_blank" href="/nav_to.do?uri=em_alert_management_rule.do?sys_id=' + newRuleGR.sys_id + '">' + newRuleGR.name + '</a>';
			gs.addErrorMessage(gs.getMessage("Rule '{0}' was already migrated to the new Alert Management rule '{1}'. Delete the new rule if you want to migrate this action rule again.", [oldRuleGR.name, link]));
			gs.info(msg);
			return true;
		}
		return false;
	},
		
	processTaskFields: function(oldRuleGR, newRuleGR) {
		if (oldRuleGR.auto_open || oldRuleGR.type != "incident" || oldRuleGR.incident_template) {
			newRuleGR.setValue("type", oldRuleGR.type);
			newRuleGR.setValue("incident_template", oldRuleGR.incident_template);
			//create sub-flow action
			var execution;
			if (oldRuleGR.auto_open) {
				if ((oldRuleGR.type != "incident") || (oldRuleGR.incident_template)) {
					execution = this.BOTH_EXECUTION;
				} else {
					execution = this.AUTOMATIC_EXECUTION;
				}
			} else {
				execution = this.MANUAL_EXECUTION;
			}
			return this.createAction(newRuleGR, this.SUBFLOW_TABLE, true, execution, this.TASK_SUBFLOW_SYS_ID);
		}
		return null;
	},

	processAutoAcknowledge: function(oldRuleGR, newRuleGR) {
		if (oldRuleGR.auto_ack) {
			var actionSysId = this.createActiveAutomaticAction(newRuleGR, this.SUBFLOW_TABLE, this.ACKNOWLEDGE_SUBFLOW_SYS_ID);
			return actionSysId;
		}
		return null;
	},

	processKB: function(oldRuleGR, newRuleGR) {
		if (oldRuleGR.kb) {
			newRuleGR.setValue("kb", oldRuleGR.kb);
			var actionSysId = this.createActiveAutomaticAction(newRuleGR, this.SUBFLOW_TABLE, this.KB_SUBFLOW_SYS_ID);
			return actionSysId;
		}
		return null;
	},
		
	processAlertTemplate: function(oldRuleGR, newRuleGR) {
		if (oldRuleGR.overwrite_template) {
			newRuleGR.setValue("overwrite_template", oldRuleGR.overwrite_template);
			var actionSysId = this.createActiveAutomaticAction(newRuleGR, this.SUBFLOW_TABLE, this.ALERT_TEMPLATE_SUBFLOW_SYS_ID);
			return actionSysId;
		}
		return null;
	},
	
	processRemediation: function(oldRuleGR, newRuleGR) {
		if (oldRuleGR.workflow && oldRuleGR.workflow.name) {
			var actionSysId = this.createAction(newRuleGR, this.WORKFLOW_TABLE, oldRuleGR.enable_remediation, oldRuleGR.execution, oldRuleGR.workflow);
			return actionSysId;
		}
		return null;
	},
	
	processLauncher: function(oldRuleGR, newRuleGR) {
		if (oldRuleGR.display_name && oldRuleGR.url) {
			var actionSysId = this.createAction(newRuleGR, this.LAUNCHER_TABLE, oldRuleGR.enable_tool_definition, this.MANUAL_EXECUTION, oldRuleGR.url, oldRuleGR.display_name);
			return actionSysId;
		}
		return null;
	},

	createAction: function(newRuleGR, table, active, execution, flow, displayName) {
		var actionGR = new GlideRecord(table);
		var sysid = newRuleGR.sys_id;
		actionGR.setValue("management_rule", newRuleGR.sys_id);
		actionGR.setValue("active", active);
		actionGR.setValue("executions_limit", 1);
		actionGR.setValue("execution", execution);
		switch(table) {
			case this.SUBFLOW_TABLE:
				actionGR.setValue("sub_flow", flow);
				break;
			case this.WORKFLOW_TABLE:
				actionGR.setValue("workflow", flow);
				break;
			case this.LAUNCHER_TABLE:
				actionGR.setValue("display_name", displayName);
				actionGR.setValue("url", flow);
		}
		var actionSysId = actionGR.insert();
		return actionSysId;
	},

	createActiveAutomaticAction: function(newRuleGR, table, subflow) {
		return this.createAction(newRuleGR, table, true, this.AUTOMATIC_EXECUTION, subflow);
	},

	cleanUp: function(){
		// if there are no active old rules, set the relevant property and deactivate old business rules
		if (gs.getProperty('evt_mgmt.alert.management.enable_legacy_alert_action_rules','true') == 'true') {
			var gr = new GlideRecord("em_alert_rule");
			gr.addActiveQuery();
			gr.query();
			if (!gr.next()) {
				gs.setProperty('evt_mgmt.alert.management.enable_legacy_alert_action_rules','false');
				gs.log("Disabling legacy alert action rules processing since there are no active alert action rules (evt_mgmt.alert.management.enable_legacy_alert_action_rules = false)");
				
				//deactivate old business rules
				var EM_legacy_rule_ids = [this.EM_RUN_AUTOMATIC_REMEDIATION_ACTIONS_ID, this.EM_APPLY_OVERWRITE_RULE_AND_VALIDATE_ID];

				var sysScriptGr = new GlideRecord("sys_script");
				sysScriptGr.addQuery("sys_id", "IN", EM_legacy_rule_ids);
				sysScriptGr.addActiveQuery();
				sysScriptGr.query();
				while (sysScriptGr.next()) {
					sysScriptGr.setValue("active", false);
					if (!sysScriptGr.name.startsWith("Legacy"))
					  sysScriptGr.setValue("name", "Legacy " + sysScriptGr.name);	
					sysScriptGr.update();
					gs.addInfoMessage(gs.getMessage("Legacy Business Rule '{0}' was disabled since there are no active Alert Action Rules.", [sysScriptGr.name]));		
					gs.log("Disabling '" + sysScriptGr.name + "' business rule since there are no active alert action rules");
				}
			}
		}
	}
};
	
