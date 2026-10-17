var EvtMgmtAlertPriorityGroups = Class.create();
EvtMgmtAlertPriorityGroups.prototype = {
	initialize: function() {
	},
	
	calculatePriorityGroups:function() {
		var start = new Date().getTime();
		var alertManager = new SNC.AlertManager();
		var numberOfProcessedAlerts = alertManager.calculateAlertPriorityGroups();
		
		if(numberOfProcessedAlerts > 0) {
			var perfJson = {};
				perfJson.processedAlerts = numberOfProcessedAlerts;
				var duration = (new Date().getTime()) - start;
				EvtMgmtCommons.get().writeToPerfTable("priorityGroupCalculation", numberOfProcessedAlerts, duration, perfJson);
			}
		},
		
		type: 'EvtMgmtAlertPriorityGroups'
	};
	
	EvtMgmtAlertPriorityGroups.get = function(){
		return new EvtMgmtAlertPriorityGroups();
	};
