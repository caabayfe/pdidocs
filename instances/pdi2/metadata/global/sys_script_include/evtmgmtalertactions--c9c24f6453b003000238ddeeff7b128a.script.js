var EvtMgmtAlertActions = Class.create();
EvtMgmtAlertActions.prototype = {
	initialize: function() {
	},
	
	type: 'EvtMgmtAlertActions'
};

EvtMgmtAlertActions.runAlertActions = function() {
		gs.warn("EvtMgmtAlertActions.runAlertActions shouldn't run anymore, it was used only in legcay Alert Actions Rules job and was replaced with EvtMgmtAlertActions.runAlertActionsFromManagementJob in the new Alert Management job ");
};


EvtMgmtAlertActions.runAlertActionsFromManagementJob = function() {
    var INCIDENT_RESOLVED = "Incident resolved";
	
	gs.include('EvtMgmtIncidentHandler');
	gs.include('EvtMgmtRemoteIncidentAdapter');
	gs.include('EvtMgmtKBHandler');
	var cmpPolicyHanlder = gs.include('CmpAlertPolicyHandler');
	
	//close alerts if associated incidents are resolved
	if (gs.getProperty('evt_mgmt.incident_closes_alert') == 'true') { // if property is turned on
		
		// Close any alerts whose incidents are already resolved or closed
		
		var remoteUrl = EvtMgmtIncidentHandler.isRemoteIncidentURLDefined();
		if (!remoteUrl){
			var inProgress = new GlideDateTime();
			var closedSecondsBack = gs.getProperty("evt_mgmt.alert_rule_close_delay", "5");
			var gt = new GlideTime(1000 * closedSecondsBack); 
			inProgress.subtract(gt);
			
			var alert = new GlideRecord('em_alert');
			// Get alerts with delay, this makes sure all BR on create/update alerts completed before the job is running
			alert.addQuery('sys_updated_on', '<=', inProgress);
			alert.addQuery('state', '!=', 'Closed');
			alert.addQuery('severity', '!=', '5');
			alert.addNotNullQuery('incident');
			var gr = alert.addJoinQuery('incident', 'incident', 'sys_id');
			gr.addCondition('state', 'IN', '6,7'); // 6 - Resolved or 7 - Closed
			
			alert.query();
			while (alert.next()) {
				// create a mapping from alert to service
				alert.setValue('state', 'Closed');
				var alertManager = new SNC.AlertManager();
				alertManager.updateWorkNotesOnAlert(alert, gs.getMessage('Closing alert because the related incident is already Resolved or Closed'));
				alertManager.setClosureReason(INCIDENT_RESOLVED);
				alert.update();
			}
		}
		
		else{ //incidents are remote
			EvtMgmtRemoteIncidentAdapter.closeResolvedAlerts();
		}
	}
	
	if (gs.getProperty('evt_mgmt.alert.management.enable_legacy_alert_action_rules','true') == 'true') {  // if property is turned on, used to disable legacy alert rules where not needed
			
		var startTime = new Date();
		//create incident for all updated alerts since previous round
		var hashGr = new GlideRecord('sa_hash');
		hashGr.addQuery('name','last_calculated_alert_job');
		hashGr.query();
		var timestamp;
		var number = 0;
		if (hashGr.next()){
			timestamp = hashGr.getValue('hash'); //get last calculated timestamp
			var inProgress = new GlideDateTime();
			var secondsBack = gs.getProperty("evt_mgmt.alert_rule_delay", "5");
			var gt = new GlideTime(1000 * secondsBack);
			inProgress.subtract(gt);
			var openStates = ["Open", "Reopen", "Flapping"];
			var recentAlerts = new GlideRecord('em_alert');
			recentAlerts.addQuery('sys_updated_on', '>=', timestamp);
			recentAlerts.addQuery('sys_updated_on', '<=', inProgress);
			recentAlerts.addQuery('state', 'IN', openStates);
			recentAlerts.query();


			var orgSessionID = gs.getSession().getCurrentDomainID();
			var alerts = [];
			var createdIncident = false;
			while (recentAlerts.next()) {
				gs.getSession().setDomainID(recentAlerts.sys_domain); // run rules and create incident in same domain as alert
				createdIncident = EvtMgmtIncidentHandler.createIncident(recentAlerts, true);
				if(createdIncident == true)
					number++;
				EvtMgmtKBHandler.setKB(recentAlerts);
				alerts.push(recentAlerts.getUniqueValue());

			}

			var toTrigger = gs.getProperty('evt_mgmt.tigger_cmp_policy', true);
			if (cmpPolicyHanlder && toTrigger) {
				var currentTime = new Date();
				CmpAlertPolicyHandler.applyPolicy(alerts);

				var timeDifference = Number((new Date().getTime() - currentTime.getTime()) / 1000).toFixed(3);
				if (timeDifference > 3) { //in case the CMP policy handler took more than 3 seconds - disable it
					gs.setProperty('evt_mgmt.tigger_cmp_policy', false);
				}
			}

			//return domain to original
			if (gs.getSession().getCurrentDomainID() != orgSessionID) {
				gs.getSession().setDomainID(orgSessionID);
			}

			hashGr.setValue('hash', inProgress);
			hashGr.update();
		}
		else {
			gs.warn("SA_HASH keys are not initialized");
		}

		if(number > 0) {
			var duration = Number((new Date().getTime() - startTime.getTime()) / 1000).toFixed(3);
			var rate = number;
			if(duration > 0)
				rate = Number(number/duration).toFixed(2);
			gs.log("Number of created incidents: " + number + ", elapsed time (sec): " + duration + ", rate (count/time): " + rate);
		}
	}
	
};
