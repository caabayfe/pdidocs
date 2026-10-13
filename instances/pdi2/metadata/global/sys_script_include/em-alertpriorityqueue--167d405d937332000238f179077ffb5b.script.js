var EM_AlertPriorityQueue = Class.create();
EM_AlertPriorityQueue.prototype = {
	initialize: function() {
	},
	
	dequeueAndProcess:function() {
		var start = new Date().getTime();
		
		var alertManager = new SNC.AlertManager();
		var numberOfProcessedAlerts = alertManager.dequeueAndProcessAlertPriority();
		if(numberOfProcessedAlerts > 0) {
			var perfJson = {};
			perfJson.processedAlerts = numberOfProcessedAlerts;
			var duration = (new Date().getTime()) - start;
			EvtMgmtCommons.get().writeToPerfTable("priorityCalculation", numberOfProcessedAlerts, duration, perfJson);
		}
	},
	
	type: 'EM_AlertPriorityQueue'
};

EM_AlertPriorityQueue.get = function(){
	return new EM_AlertPriorityQueue();
};
