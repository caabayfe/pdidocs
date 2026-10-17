var SaMetricSchemaCacheSync = Class.create();
SaMetricSchemaCacheSync.prototype = {
    initialize: function() {
    },

    type: 'SaMetricSchemaCacheSync'
};

SaMetricSchemaCacheSync.checkTableForUpdateSendEccReq = function(tableName, milliSecondFieldName) {
		
	try {
		
		gs.debug("checkTableForUpdateSendEccReq for " + tableName + " with milliSecondFieldName=" + milliSecondFieldName);
		gs.debug("SaMetricSchemaCacheSync 1");
		var lastMilliSecondValue = EvtMgmtMetricCacheHandler.wasTableUpdated(tableName, milliSecondFieldName);
		if (lastMilliSecondValue > 0) {
			gs.debug("SaMetricSchemaCacheSync 2");
			if (this.sendEccQueueUpdateRequest(tableName, lastMilliSecondValue)) {
				EvtMgmtMetricCacheHandler.updateHash(tableName, lastMilliSecondValue);
			}
		}
		else {
			gs.debug("checkTableForUpdateSendEccReq got lastUpdateMS value " + lastMilliSecondValue + ", for table " + tableName);
		}
		
	} catch(e) {
		gs.logError("SaMetricSchemaCacheSync.checkTableForUpdateSendEccReq script include failed: " + e);
	}

};

//will return rather the send ecc command succeded
SaMetricSchemaCacheSync.sendEccQueueUpdateRequest = function() {
	var res = true;
	try {
		var probe = SncProbe.get("Update metric schema cache");
		gs.debug("Got probe " + probe);
		probe.setEccPriority("0"); //Interactive ecc priority
		var midsToSendTo = SNC.MetricScriptableApis.getMapOfOneRunningMidServerForEachCluster();
		
		for(var i =0; i < midsToSendTo.size(); i++) {
			
			var localRes = probe.create(midsToSendTo.get(i));
			gs.debug("sending ecc update to mid: " + midsToSendTo.get(i));

			//make sure localRes doesn't has a value
			if (!(localRes)) { 
				res = false;
				gs.logError("SaMetricSchemaCacheSync.sendEccQueueUpdateRequest Error on sending probe to mid : " + midsToSendTo.get(i));				
			}					
		}
		return res;
	} catch(e) {
		gs.logError("SaMetricSchemaCacheSync.sendEccQueueUpdateRequest script include failed: " + e);
		return false;
	}
};
