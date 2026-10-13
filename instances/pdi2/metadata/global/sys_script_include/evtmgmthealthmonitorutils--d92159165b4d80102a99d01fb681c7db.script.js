var EvtMgmtHealthMonitorUtils = Class.create();
EvtMgmtHealthMonitorUtils.prototype = {
	
    initialize: function() {
		
		this.errorThreshold = 4;
    },
	
	createFormattedDescription: function(desc, descRemediation, descAddInfo) {
		
		var retDesc = '';
		
		//var problem = gs.getMessage("=== Problem Description ===\n{0}\n", desc);
		var problem =desc;
		
		var remediation = '';
		if (descRemediation && descRemediation.length) {
			remediation = gs.getMessage("\n\n To remediate the issue follow these steps:\n{0}\n",  descRemediation);
		}
		
		var additionalInfo = '';
		if (descAddInfo) {
			additionalInfo = gs.getMessage("\n Additional Info \n{0}", descAddInfo);
		}
		
		var descObj = {
			desc: desc,
			descRemediation: descRemediation,
			descAddInfo: descAddInfo,
			fmtDesc: problem + remediation + additionalInfo
		};
		
		return descObj;
	},
	
	createFormattedLogMessage: function(monitor, desc, descAddInfo, isEvent, sysId) {
		
		var retMsg = '';
		var logMsg = gs.getMessage("Self Health Monitoring - {0}:\n", monitor);
		var problem = gs.getMessage("{0}", desc);
		var additionalInfo = gs.getMessage("\n{0}\n", descAddInfo);
		var msgKeyInfo = '';
		if (isEvent) {
			msgKeyInfo = gs.getMessage("Event's sys id is: {0}", sysId);
		} else { // alert
			msgKeyInfo = gs.getMessage("Alert's sys id is: {0}", sysId);
		}
		
		retMsg = logMsg + problem + additionalInfo + msgKeyInfo;
			
		return retMsg;	
	},
	
	getJobStateByValue: function(stateVal) {

		if (stateVal == -1)
			return 'Error';
		if (stateVal == 0)
			return 'Ready';
		if (stateVal == 1)
			return 'Running';
		if (stateVal == 2)
			return 'Queued';
		return 'undefined state value';
	},
	
	writeToLog: function(monitorName, logDesc, logDescAddInfo, isEvent, alertSysId, severity) {
		
		var logMsg = this.createFormattedLogMessage(monitorName, logDesc, logDescAddInfo, isEvent, alertSysId);
				
		if (severity < this.errorThreshold) {
			gs.error(logMsg);
		} else {
			gs.warn(logMsg);
		}
	},

    type: 'EvtMgmtHealthMonitorUtils'
};
