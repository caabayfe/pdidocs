var EvtMgmtCloseDuplicateAlerts = Class.create();
EvtMgmtCloseDuplicateAlerts.prototype = {
    initialize: function() {
		
		SCRIPT_NAME = "EvtMgmtCloseDuplicateAlerts";
		
		this.minStartedUpgradeTimeSec = 2*60*60;
		this.maxStartedUpgradeTimeDays = 2;
		this.logLimit = 10;
		this.isClosingDuplicate = true;
    },
	
	closeDuplicateAlerts: function(fromTime) {
		
		var now = new GlideDateTime();

		if (fromTime != null) {
			this.findDuplications(fromTime, now);
			return;
		}

		var upgradeStartedTime = this.getUpgradeStartedTime();
		if (upgradeStartedTime == null || upgradeStartedTime == "") {
			gs.info("'{0}': upgradeStartedTime is not a valid date", SCRIPT_NAME);
			return;
		}
	
		// use the last upgrade started time to calculate fromTime
		var fromTimeGlide = this.getFromTime(upgradeStartedTime, now);
		this.findDuplications(fromTimeGlide, now);
	},
	
	getAllOpenStates: function() {
		
		return ["Open", "Reopen", "Flapping"];
	},
	
	getUpgradeStartedTime: function() {
		
		var upgradeStartedTime = "";
		
		var upgradeGr = new GlideRecord('sys_upgrade_history');
		upgradeGr.orderByDesc("upgrade_started");
		upgradeGr.addQuery("from_version", "CONTAINS", "glide");
		upgradeGr.addQuery("to_version", "CONTAINS", "glide");
		upgradeGr.setLimit(1);
		upgradeGr.query();
		
		if (upgradeGr.next())
			upgradeStartedTime = upgradeGr.upgrade_started;
				
		return upgradeStartedTime;
	},
	
	getFromTime: function(upgradeStartedTime, nowGlideTime) {
		
		// if  secsAgo <= upgradeStartedTime <= daysAgo, then last upgrade time makes sense.
		// Otherwise we return secsAgo or daysAgo as fromTime

		var upgradeStartedGlideTime = new GlideDateTime(upgradeStartedTime);
		
		var secsAgo = new GlideDateTime(nowGlideTime);
		var secs = gs.getProperty("evt_mgmt.min_started_upgrade_time_sec", this.minStartedUpgradeTimeSec);
		var secsBack = -1*secs;
		secsAgo.addSeconds(secsBack);
		
		var daysAgo = new GlideDateTime(nowGlideTime);
		var days = gs.getProperty("evt_mgmt.max_started_upgrade_time_days", this.maxStartedUpgradeTimeDays);
		var daysBack = -1*days;
		daysAgo.addDays(daysBack);

		var timeDiff = upgradeStartedGlideTime.compareTo(secsAgo);
		if (timeDiff > 0)  // upgrade started less than two hours ago => too short time
			return secsAgo;
		
		timeDiff = upgradeStartedGlideTime.compareTo(daysAgo);
		if (timeDiff < 0)  // upgrade started more than two days ago => too long time
			return daysAgo;
		
		return upgradeStartedTime;
	},
	
	updateTargetAlertEventCount: function(targetAlertId, eventCount) {

		var alertGr = new GlideRecord('em_alert');
		alertGr.addQuery("sys_id", targetAlertId);
		alertGr.query();
		
		if (alertGr.next()) {
			
			alertGr.event_count = eventCount;
			alertGr.update();
		}
	},
	
	getWorkNoteMsg: function(alertNumber) {
		
		var workNoteMsg = 
			gs.getMessage("This alert is a duplication of {0}. It was closed automatically by the script: '{1}'.",
							[alertNumber, SCRIPT_NAME]);
		
		return workNoteMsg;
	},
	
	updateDuplicateAlert: function(alertDupGr, alertManager, targetAlertNumber, alertLogCount) {
		
		if (this.isClosingDuplicate && alertLogCount < this.logLimit) {
			gs.info("'{0}': Closing a duplicate alert with sys_id: {1}", [SCRIPT_NAME, alertDupGr.getValue("sys_id")]);
		}	
		
		alertDupGr.state = "Closed";
		
		alertDupGr.event_count = 0;

		var workNoteMsg = this.getWorkNoteMsg(targetAlertNumber);
		alertManager.updateWorkNotesOnAlert(alertDupGr, workNoteMsg);
		
		alertDupGr.update();
		
		return;
	},
	
	updateEvents: function(targetAlertId, curAlertId, fromTime, toTime) {
		
		// events that are bound to duplicate alerts get bound to the target alert

		var evtDupGr = new GlideRecord('em_event');
		evtDupGr.addQuery("sys_created_on", ">=", fromTime);
		evtDupGr.addQuery("sys_created_on", "<=", toTime);
		evtDupGr.addQuery("state", "Processed");
		evtDupGr.addQuery("alert", curAlertId);
		evtDupGr.query();
		var eventsCount = evtDupGr.getRowCount();

		if (targetAlertId == curAlertId)
			return eventsCount;
		
		while (evtDupGr.next()) {

			evtDupGr.alert = targetAlertId;
			evtDupGr.update();
		}
		
		return eventsCount;
	},
	
	handleCloseDuplicates: function(alertDupGr, alertManager, fromTime, toTime) {
		
		var targetAlertId = "";
		var targetAlertNumber = "";
		var totalEventCount = 0;
		var alertLogCount = 0;
		
		if (alertDupGr.next()) {  // refer to the first alert as target

			targetAlertNumber = alertDupGr.getValue("number");
			targetAlertId = alertDupGr.getValue("sys_id");
			totalEventCount +=  this.updateEvents(targetAlertId, targetAlertId, fromTime, toTime);
		}

		while (alertDupGr.next()) {  // refer to the rest as duplicate alerts

			var alertDupId = alertDupGr.getValue("sys_id");
			totalEventCount +=  this.updateEvents(targetAlertId, alertDupId, fromTime, toTime);
			this.updateDuplicateAlert(alertDupGr, alertManager, targetAlertNumber, alertLogCount);
			alertLogCount ++;
		}

		this.updateTargetAlertEventCount(targetAlertId, totalEventCount);
	},
	
	handlePrintDuplicates: function(msgKey, alertDupGr) {
		
		gs.info("The following alerts with duplicate message key - {0} are not closed:", msgKey);
			while (alertDupGr.next()) {
				gs.info(
					"Alert Number: {0}, Alert sys_id: {1}", [alertDupGr.getValue("number"), alertDupGr.getValue("sys_id")]);
			}
	},
	
	closeDuplications: function(alertManager, msgKey, fromTime, toTime) {
			
		var alertDupGr = new GlideRecord('em_alert');
		alertDupGr.addQuery("sys_created_on", ">=", fromTime);
		alertDupGr.addQuery("sys_created_on", "<=", toTime);
		alertDupGr.addQuery("state", "IN", this.getAllOpenStates());
		alertDupGr.addQuery("message_key", msgKey);
		alertDupGr.query();  // query alerts with the same message_key
		
		if (!this.isClosingDuplicate) {
			
			this.handlePrintDuplicates(msgKey, alertDupGr);
			
		} else {
		
			this.handleCloseDuplicates(alertDupGr, alertManager, fromTime, toTime);
		}
	},
	
	findDuplications: function(fromTime, toTime) {
		
		// find all duplicate alerts

		var alertManager = new SNC.AlertManager();
		var msgKeyLogCount = 0;
		
		var alertGr = new GlideAggregate('em_alert');
		alertGr.addQuery("sys_created_on", ">=", fromTime);
		alertGr.addQuery("sys_created_on", "<=", toTime);
		alertGr.addQuery("state", "IN", this.getAllOpenStates());
		alertGr.addAggregate('COUNT', 'message_key');
		alertGr.groupBy('message_key');
		alertGr.addHaving('COUNT', '>', '1');
		alertGr.query();

		// iterate over all groups of alerts with the same message_key
		while (alertGr.next()) {
			
			var msgKey = alertGr.getValue("message_key");

			if (this.isClosingDuplicate && msgKeyLogCount < this.logLimit) {
				gs.info("'{0}': Found a duplicate message key: {1}", [SCRIPT_NAME, msgKey]);
				msgKeyLogCount ++;			
			}
			
			this.closeDuplications(alertManager, msgKey, fromTime, toTime);
		}	
	},
	
	printDuplicateAlerts: function(fromTime) {
		
		this.isClosingDuplicate = false;
		this.closeDuplicateAlerts(fromTime);
	},

    type: 'EvtMgmtCloseDuplicateAlerts'
};
