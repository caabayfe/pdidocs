var EvtMgmtMetricCacheHandler = Class.create();
EvtMgmtMetricCacheHandler.prototype = {
    initialize: function() {
    },

    type: 'EvtMgmtMetricCacheHandler'
};

EvtMgmtMetricCacheHandler.printDebug = function(prefixMessage, funcName, tableName, orgTableName, milliSecondFieldName, lastMilliSecondValue,suffixMessage) {
	if(gs.getProperty('evt_mgmt.log_debug', 'false') == 'true'){
		
		var debugMsg = "";
		
		if (prefixMessage)
			debugMsg = prefixMessage + " "; 		

		if (funcName)
			debugMsg += "on EvtMgmtMetricCacheHandler." + funcName + "()";
		
		if (tableName)
			debugMsg += ", tableName= " + tableName; 		
		
		if (orgTableName)
			debugMsg += ", orgTableName= " + orgTableName; 
		
		if (milliSecondFieldName)
			debugMsg += ", milliSecondFieldName= " + milliSecondFieldName; 
			
		if (lastMilliSecondValue)
			debugMsg += ", lastMilliSecondValue= " + lastMilliSecondValue;
		
		if (suffixMessage)
			debugMsg += ". " + suffixMessage + ", "; 
		
		gs.debug(debugMsg);
	}
};

EvtMgmtMetricCacheHandler.checkTableForUpdateSendEccReq = function(tableName, orgTableName, milliSecondFieldName) {
		
	try {
	
		this.printDebug("Start func", "checkTableForUpdateSendEccReq", tableName, orgTableName, milliSecondFieldName, "", "");
		
		var lastMilliSecondValue = this.wasTableUpdated(tableName,milliSecondFieldName);
				
		this.printDebug("After wasTableUpdated", "checkTableForUpdateSendEccReq", tableName, orgTableName, milliSecondFieldName, lastMilliSecondValue, "");
		
		if (lastMilliSecondValue > 0) {
			if (this.sendEccQueueUpdateRequest(tableName, orgTableName, lastMilliSecondValue)) {
				this.updateHash(tableName, lastMilliSecondValue);
			}
		}
		
	} catch(e) {
		gs.logError("EvtMgmtMetricCacheHandler.checkTableForUpdateSendEccReq script include failed: " + e +", " + e.stack);
	}

};

//Will return the last milliSecondFieldName which is bigger then the last hash,0 if there are no results bigger, or < 0 for errors
EvtMgmtMetricCacheHandler.wasTableUpdated = function(tableName, milliSecondFieldName) {
	
	try {
		var hashGr = new GlideRecord("sa_hash");
		hashGr.addQuery("name", tableName + ".lastUpdatedMS");
		hashGr.query();
		
		var lastTimeMS = 0;

		if (hashGr.next()) {
			lastTimeMS = hashGr.getValue("hash");
		}
		else {
			hashGr.initialize();
			hashGr.setValue("name", tableName + ".lastUpdatedMS");
			hashGr.setValue("hash", lastTimeMS);
			hashGr.insert();
		}

		var tableGr = new GlideRecord(tableName);
		if ((milliSecondFieldName) && (tableGr.isValidField(milliSecondFieldName))) {

			tableGr.addQuery(milliSecondFieldName, ">", lastTimeMS);
			tableGr.orderByDesc(milliSecondFieldName);
			tableGr.setLimit(1);
			tableGr.query();

			if (tableGr.next()) {
				return tableGr.getValue(milliSecondFieldName);
			}

			return 0;
		}
		
		gs.logError(gs.getMessage("EvtMgmtMetricCacheHandler.wasTableUpdated script include field. milliSecondFieldName <{0}> isn't a valid field on table <{1}>.", [milliSecondFieldName, tableName]));		
		return (-1);
	
	} catch(e) {
		gs.logError("EvtMgmtMetricCacheHandler.wasTableUpdated script include failed: " + e);
		return (-2);
	}
};

EvtMgmtMetricCacheHandler.updateHash = function(tableName, lastMilliSecondValue) {
	
	try {
		var hashGr = new GlideRecord("sa_hash");
		hashGr.addQuery("name", tableName + ".lastUpdatedMS");
		hashGr.query();

		if (hashGr.next()) {
			hashGr.setValue("hash", lastMilliSecondValue);
			hashGr.update();	
		}
		else { //need to first create that record
			hashGr.initialize();
			hashGr.setValue("name", tableName + ".lastUpdatedMS");
			hashGr.setValue("hash", lastMilliSecondValue);
			hashGr.insert();
		}	
	} catch(e) {
		gs.logError("EvtMgmtMetricCacheHandler.updateHash script include failed: " + e +", " + e.stack);
	}
};

//will return rather the send ecc command succeded
EvtMgmtMetricCacheHandler.sendEccQueueUpdateRequest = function(tableName, orgTableName , lastMilliSecondValue) {
	
	var res = true;
	
	try {
		var probe = SncProbe.get("Update Cache Probe");
		
		this.printDebug("Got probe", "sendEccQueueUpdateRequest", tableName, orgTableName, "", lastMilliSecondValue, "probe is" + probe);

		probe.setEccPriority("2"); //Standard ecc priority
		probe.addParameter('table_name', tableName);
		probe.addParameter('original_table_name', orgTableName);
		probe.addParameter('last_updated_millis', lastMilliSecondValue);
			
		var midsToSendTo = SNC.MetricScriptableApis.getMapOfOneRunningMidServerForEachCluster();
			
		this.printDebug("Sending ecc update command", "sendEccQueueUpdateRequest", tableName, orgTableName, "", lastMilliSecondValue, "for mids " + midsToSendTo);
	
		for(var i =0; i < midsToSendTo.size(); i++) {
			
			var localRes = probe.create(midsToSendTo.get(i));
							
			//make sure localRes doesn't has a value
			if (!(localRes)) { 
				res = false;
				gs.logError("EvtMgmtMetricCacheHandler.sendEccQueueUpdateRequest Error on sending probe to mid : " + midsToSendTo.get(i));				
			}					
		}
		
		this.printDebug("Finished", "sendEccQueueUpdateRequest", tableName, orgTableName, "", lastMilliSecondValue, "");
		
		return res;
		
	} catch(e) {
		gs.logError("EvtMgmtMetricCacheHandler.sendEccQueueUpdateRequest script include failed: " + e +", " + e.stack);
		return false;
	}
};


//will return rather the send ecc command succeded
EvtMgmtMetricCacheHandler.sendEccQueueResetRequest = function(tableName) {
	
	var res = true;
	
	try {
		var probe = SncProbe.get("Reset Cache Probe");
		
		this.printDebug("Sending reset command. Got probe", "sendEccQueueResetRequest", tableName, "", "", "", "probe is" + probe);

		
		probe.setEccPriority("2"); // Standard ecc priority
		probe.addParameter('table_name', tableName);
		
		var midsToSendTo = SNC.MetricScriptableApis.getMapOfOneRunningMidServerForEachCluster();
		
		this.printDebug("Sending reset command", "sendEccQueueResetRequest", tableName, "", "", "", "for mids " + midsToSendTo);
		
		for(var i =0; i < midsToSendTo.size(); i++) {
			
			var localRes = probe.create(midsToSendTo.get(i));
					
			//make sure localRes doesn't has a value
			if (!(localRes)) { 
				res = false;
				gs.logError("EvtMgmtMetricCacheHandler.sendEccQueueResetRequest Error on sending probe to mid : " + midsToSendTo.get(i));				
			}					
		}
		
		return res;
		
	} catch(e) {
		gs.logError("EvtMgmtMetricCacheHandler.sendEccQueueResetRequest script include failed: " + e +", " + e.stack);
		return false;
	}
};

EvtMgmtMetricCacheHandler.updateMilliSeconds = function(glideRecord, milliSecondFieldName) {
	if (milliSecondFieldName) {
		if (glideRecord.isValidField(milliSecondFieldName)) {
			glideRecord.setValue(milliSecondFieldName,new GlideDateTime().getNumericValue());
		}
	}
};

EvtMgmtMetricCacheHandler.copyDeletedRecord = function(glideRecord, deletedTableName) {
	
	var deleteGR = new GlideRecord(deletedTableName);
	deleteGR.setValue("deleted_sys_id", glideRecord.getUniqueValue());
	// insert domain of the deleted record
	var deletedRecordDomain = glideRecord.sys_domain;
	// If a record had global domain, we need to fake the session to be domain before we insert
	if (deletedRecordDomain == 'global') {
		var domainToUse = 'global';
		var origDomainID = gs.getSession().getCurrentDomainID();
		try {
			gs.getSession().setDomainID(domainToUse);	
			deleteGR.insert();
		} finally {
			gs.getSession().setDomainID(origDomainID);
		}
	}
	else {
		deleteGR.setValue("sys_domain", deletedRecordDomain);
		deleteGR.insert();	
	}
};

EvtMgmtMetricCacheHandler.copyDeletedDetailRecord = function(glideRecord, deletedTableName) {
	
	var deleteGR = new GlideRecord(deletedTableName);
	deleteGR.setValue("deleted_sys_id", glideRecord.getUniqueValue());
	deleteGR.setValue("deleted_ci_sys_id",glideRecord.getValue("cmdb_ci"));
	deleteGR.setValue("deleted_resource_id",glideRecord.getValue("resource_id"));
	deleteGR.setValue("deleted_metric_type_id",glideRecord.getValue("metric_type_id"));
	deleteGR.setValue("metric_identifier",glideRecord.getValue("metric_identifier"));
	deleteGR.setValue("updated_on_milliseconds", new GlideDateTime().getNumericValue());
	var deletedRecordDomain = glideRecord.sys_domain;
	// If a record had global domain, we need to fake the session to be domain before we insert
	if (deletedRecordDomain == 'global') {
		var domainToUse = 'global';
		var origDomainID = gs.getSession().getCurrentDomainID();
		try {
			gs.getSession().setDomainID(domainToUse);	
			deleteGR.insert();
		} finally {
			gs.getSession().setDomainID(origDomainID);
		}
	}
	else {
		deleteGR.setValue("sys_domain", deletedRecordDomain);
		deleteGR.insert();	
	}
};
