var ResetImpactOnServices = Class.create();
ResetImpactOnServices.prototype = {
    initialize: function() {
		this.NUMBER_OF_ALERTS_BEFORE_SLEEP = 1000;
		this.ALERT_SLEEP_TIME = 1000 * 5; // 5 seconds
		this.SLEEP_TIME_AFTER_DISABLE_IMPACT_JOB = 1000 * 60 * 2; // 2 minutes
		this.TOUCH_IMPACTED_ALERTS = gs.getProperty("evt_mgmt.reset.touch_active_alerts", "true");
		this.REBUILD_SERVICES = gs.getProperty("evt_mgmt.reset.rebuild_services", "false");
    },
	
	resetImpact: function() {
		var sw = new GlideStopWatch();
		gs.log("ResetImpactOnServices: Disable impact calculation jobs");
		this.setImpactEnabled("false");
		gs.log("ResetImpactOnServices: Going to sleep for " + this.SLEEP_TIME_AFTER_DISABLE_IMPACT_JOB + " milliseconds to make sure impact jobs does not running");
		gs.sleep(this.SLEEP_TIME_AFTER_DISABLE_IMPACT_JOB);
		
		gs.log("ResetImpactOnServices: Truncating em_alert_history table");
		GlideDBUtil.truncateTable("em_alert_history");
		gs.log("ResetImpactOnServices: Truncating em_impact_status table");
		GlideDBUtil.truncateTable("em_impact_status");
		
		gs.log("ResetImpactOnServices: Enable impact calculation jobs");
		
		if(this.REBUILD_SERVICES == "true") {
			gs.log("ResetImpactOnServices: Truncating em_impact_graph table");
			GlideDBUtil.truncateTable("em_impact_graph");
			this.rebuildServices();
		}
		this.setImpactEnabled("true");
		
		// Touch all impacted alerts
		if(this.TOUCH_IMPACTED_ALERTS == "true")
			this.touchActiveAlerts();
		
		gs.log("ResetImpactOnServices: Script finished in " + sw.getTime() + " milliseconds");
	},
	
	rebuildServices: function() {
		// Truncate em_impact_graph"
		gs.log("ResetImpactOnServices: Truncating em_impact_changes table");
		GlideDBUtil.truncateTable("em_impact_changes");
		
		var serviceGr = new GlideRecord("cmdb_ci_service_auto");
		serviceGr.addQuery("operational_status", "1");
		serviceGr.query();
		gs.log("ResetImpactOnServices: Going to rebuild " + serviceGr.getRowCount() + " services");
		while (serviceGr.next()) {
			// Mark the services need a rebuild in em_impact_changes table
			var impactChangeGr = new GlideRecord("em_impact_changes");
			impactChangeGr.setValue("service", serviceGr.getUniqueValue());
			impactChangeGr.setValue("require_rebuilding", "1");
			impactChangeGr.insert();
		}
	},
	
	touchActiveAlerts: function() {
		var alertGr = new GlideRecord("em_alert");
		alertGr.addQuery("severity", "IN", "1,2,3,4");
		alertGr.addQuery("state", "IN", "Open, Reopen, Flapping");
		alertGr.addQuery("maintenance", "0");
		alertGr.query();
		gs.log("ResetImpactOnServices: Going to update " + alertGr.getRowCount() + " alerts");
		var count = 0;
		while (alertGr.next()) {
				alertGr.setForceUpdate(true);
				alertGr.setWorkflow(false);
				alertGr.update();
				count++;
				if(count >= this.NUMBER_OF_ALERTS_BEFORE_SLEEP) {
					gs.sleep(this.ALERT_SLEEP_TIME);
					gs.log("ResetImpactOnServices: Going to sleep for " +  this.ALERT_SLEEP_TIME + " milliseconds after handling " + count +  " alerts" );
					count = 0;
				}
		}
	},
	
	setImpactEnabled: function(value) {
        var grSaHash = new GlideRecord("sa_hash");
        grSaHash.addQuery("name","impact_calculation_enable");
        grSaHash.query();
        grSaHash.next();
        grSaHash.setValue("hash",value);
        grSaHash.update();
    },

    type: 'ResetImpactOnServices'
};
