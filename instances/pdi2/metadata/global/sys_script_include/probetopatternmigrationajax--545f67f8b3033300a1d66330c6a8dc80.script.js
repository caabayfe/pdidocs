var ProbeToPatternMigrationAjax = Class.create();
ProbeToPatternMigrationAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	overallResultLog : "",

	ajaxFunction_runScript: function() {
		var ptpLog = new GlideRecord("probe_to_pattern_log");
		var logId = ptpLog.insert();
		var ciType = "" + this.getParameter('sysparm_type');
		switch (ciType) {
			case "all":
				this.runJob("FixMissingRelationsFromProbesToPatterns.moveProbesToPatterns('" + logId + "');");
				break;
			case "windows":
				this.runJob("var fix = new FixWindowsModelForPatterns();fix.setLogRecord('" + logId + "'); fix.addMissingRelationsForWindows();");
				break;
			case "unix":
				this.runJob("var fix = new FixUnixFamilyModelForPatterns();fix.setLogRecord('" + logId + "'); fix.addMissingRelationsForUnix();");
				break;
			case "network":
				this.runJob("var fix = new FixSwitchAndRouterModelForPatterns();fix.setLogRecord('" + logId + "'); fix.addMissingRelationsForSwitchesAndRouters();");
				break;
			case "load_balancer":
				this.runJob("var fix = new FixPatternLoadBalancersModel();fix.setLogRecord('" + logId + "'); fix.addMissingRelationsForLoadBalancers();");
				break;
			case "application":
				this.runJob("var fix = new FixApplicationModelForPatterns();fix.setLogRecord('" + logId + "'); fix.addMissingRelationsForApplications();");
				break;
			case "prereq":
				this.runJob("var pre = new ProbeToPatternPrerequisiteScript();pre.setLogRecord('" + logId + "'); pre.runAllPrerequisitesCheck();");
				break;
			default:
				gs.addErrorMessage(gs.getMessage("Invalid Selection"));
				ptpLog.get(logId);
				ptpLog.deleteRecord();
		}
		var result = this.newItem("result");
		result.setAttribute("logId", logId);
	},

	runJob: function(script) {
		var trigger = new GlideRecord('sys_trigger');
		trigger.initialize();
		trigger.name = "ProbeToPatternMigration";
		trigger.script = script;
		trigger.trigger_type = 0; //Run Once
		trigger.next_action.setDateNumericValue(0); //Run immediately
		trigger.insert();
	},

	type: 'ProbeToPatternMigrationAjax'
});
