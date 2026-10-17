var EmAiInsightCommon = Class.create();
var INSIGHT_STATE_TABLE = "em_alert_insight_state";
var ALERT = "alert";
var CURRENT_CALCULATION = "current_calculation";
var PROCESS_STATE = "process_state";
var QUERY_STRING = "queryString";
var COUNT = "count";
var TABLE_NAME = "tableName";
var TYPE_NAME = "typeName";
var CALCULATION_TIME = "calculationTime";

var IN_PROGRESS_STATE = "1";
var DONE_STATE = "2";
var REMOVED_STATE = "3";
var NOT_PROCESSING_STATE = "4";

EmAiInsightCommon.prototype = {
    initialize: function() {
		this.evtMgmtCommons = new EvtMgmtCommons();
    },
	
	readFromInsightState: function(alertSysId) {
		this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: EmAiInsightCommon - readFromInsightState function; alert: " + alertSysId);
		var gr = new GlideRecord(INSIGHT_STATE_TABLE);
		gr.addQuery("alert", alertSysId);
		gr.addQuery(PROCESS_STATE, "IN", [IN_PROGRESS_STATE, DONE_STATE, NOT_PROCESSING_STATE]);
		gr.query();
		if (gr.next()) {
			this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: EmAiInsightCommon - read from insight state table; found record for alert: " + alertSysId + "; process state: " + this.getProcessStateByValue(gr.getValue(PROCESS_STATE)));
			return gr;
		}
		return null;
	},
	
	writeToInsightState: function(alertSysId, currentCalculationTime, processState) {
		this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: EmAiInsightCommon - write to insight state table; alert: " + alertSysId);
		var insightStateSysId = "";
		var gr = this.readFromInsightState(alertSysId);
		if (gr != null) { //update the record
			insightStateSysId = gr.getUniqueValue();
			
			if (processState == IN_PROGRESS_STATE /*in progress*/) {
				//in case there is already state record for this alert, change the state for the existing one to 'Removed' and create new state record with 'In progress' state
				var previnsightStateSysId = insightStateSysId;
				this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: EmAiInsightCommon - inserting new record to insight state table for alert: " + alertSysId + "; state: " + this.getProcessStateByValue(processState));
				insightStateSysId = this.insertNewRecord(alertSysId, currentCalculationTime, processState);
				
				this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: EmAiInsightCommon - marking a previous state record to Removed state: " + previnsightStateSysId);
				//updating existing record to Removed
				gr.setValue(PROCESS_STATE, REMOVED_STATE); //Removed state
				gr.update();
			
			} else { //updating state record to Done
				this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: EmAiInsightCommon - updating existing record: " + insightStateSysId + "; state: " + this.getProcessStateByValue(processState));
				gr.setValue(CURRENT_CALCULATION, currentCalculationTime);
				gr.setValue(PROCESS_STATE, processState);
				gr.update();
			}

		} else { //insert new record
			this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: EmAiInsightCommon - inserting new record for alert: " + alertSysId + "; state: " + this.getProcessStateByValue(processState));
			insightStateSysId = this.insertNewRecord(alertSysId, currentCalculationTime, processState);
		}
		return insightStateSysId;
	},
	
	removeStateRecord: function(alertSysId) {
		var gr = this.readFromInsightState(alertSysId);
		
		if (gr != null) {
			this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight (EmAiInsightCommon): removeStateRecord - changing state to Removed" + ": " + gr.getUniqueValue());
			gr.setValue(PROCESS_STATE, REMOVED_STATE); //Removed state
			gr.update();
		}
	},
	
	insertNewRecord: function(alertSysId, currentCalculationTime, processState) {
		var gr = new GlideRecord(INSIGHT_STATE_TABLE);
		gr.setValue(ALERT, alertSysId);
		gr.setValue(CURRENT_CALCULATION, currentCalculationTime);
		gr.setValue(PROCESS_STATE, processState);
		return gr.insert();
	},
	
	toCalculate: function(alertSysId) {
		var gr = this.readFromInsightState(alertSysId);
		if (gr == null || this.toCalculateByState(gr)) {
			//calculate on demand only if there was no calculating and no state record for this alert (if first load is from alert platform form) 
			//OR if there is a done/not processing state record for this alert
			return true;
		}

		return false;
		
	},
	
	toCalculateByState: function(gr) {
		if (gr != null && gr.getValue(PROCESS_STATE) === DONE_STATE /*Done state*/ || gr.getValue(PROCESS_STATE) === NOT_PROCESSING_STATE /*state NotProcessing*/) {
			return true;
		}
	},
	
	isDoneCalculating: function(alertSysId) {
		var result = {};
		var gr = this.readFromInsightState(alertSysId);
		if (gr != null && gr.getValue(CURRENT_CALCULATION) != "" && this.toCalculateByState(gr)) {
			result.done = true;
			result.sysId = gr.getUniqueValue();
			result.timestamp = gr.getValue("current_calculation");
		} else {
			result.done = false;
		}
		return result;
	},
	
	getRelatedTaskQuery: function(insightStateId, dataArr, timestamp) {
		this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: EmAiInsightCommon - getRelatedTaskQuery. Insight state id: " + insightStateId + "; current calculation timestamp: " + timestamp);
	    var jsonArr = [];
		for (i = 0; i < dataArr.length; i++) { 
			var grQuery = this.getGrQueryByTaskType(insightStateId, dataArr[i].task);
			var count = this.getCount("em_alert_related_task", grQuery);
			var jsonTask = this.getResultJson(count, "em_alert_related_task", dataArr[i].insightType, grQuery.getEncodedQuery(), timestamp);
			jsonArr.push(jsonTask);
		}
		return jsonArr;
	},
	
	getEmptyTaskQuery: function(dataArr) {
		this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: EmAiInsightCommon - getEmptyTaskQuery. Data: " + JSON.stringify(dataArr));
	    var jsonArr = [];
		for (i = 0; i < dataArr.length; i++) {
			var jsonTask = this.getResultNoQueryJson(dataArr[i].insightType);
			jsonArr.push(jsonTask);
		}
		return jsonArr;
	},
	
	getGrQueryByTaskType: function(insightStateId, taskType) {
		this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: EmAiInsightCommon - getGrQueryByTaskType. Insight state id: " + insightStateId + "; task type: " + taskType);
		var gr = new GlideRecord("em_alert_related_task");
		gr.addQuery("current_calculation", insightStateId);
		gr.addQuery("task_type", taskType);
		return gr;
	},
	
	calculate: function(alertSysId, tasks) {
		var start = new Date().getTime();
		this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: EmAiInsightCommon - calculate for alert: " + alertSysId + "; tasks: " + tasks);
		var alertGr = new GlideRecord("em_alert");
		if (alertGr.get(alertSysId)) {
			var ci = alertGr.getValue("cmdb_ci");
			if(!GlideStringUtil.nil(ci)) {
				var emAiInsight = new EmAiCalculateRelatedTasks();
				emAiInsight.calculateRelatedTasks(alertGr, tasks);
				var duration = (new Date().getTime()) - start;
				this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: EmAiInsightCommon -calculate  finished in: " + duration + " milliseconds");
			} else {
				this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: EmAiInsightCommon - Not calculating. This alert does not have an associated CI");
				this.writeToInsightState(alertSysId, new GlideDateTime(), NOT_PROCESSING_STATE);
			}

		}
	},
	
	addTaskQueryTimeRange: function(taskGr, alertGr) {
		var timeBeforeMin = GlideProperties.get("evt_mgmt.alert_insight_task_history_min", 10080); //7 days
		if(timeBeforeMin < 10080)
			timeBeforeMin = defaultValue;
		var timeAfterMin = GlideProperties.get("evt_mgmt.alert_insight_closed_alert_window", 4320); //3 days
		if(timeAfterMin < 4320)
			timeAfterMin = defaultValue;
		
		var alertCreationTime = alertGr.getValue("sys_created_on");
		
		var timeBeforeDate = new GlideDateTime(alertCreationTime);
		timeBeforeDate.addSeconds(-1 * timeBeforeMin * 60);
		taskGr.addQuery("sys_updated_on", ">", timeBeforeDate);
		
		if (alertGr.getValue("state") == "Closed") {
			var timeAfterDate = new GlideDateTime(alertCreationTime);
			timeAfterDate.addSeconds(timeAfterMin * 60);
			taskGr.addQuery("sys_updated_on", "<", timeAfterDate);
		}
		
	},
	
	// Get a limit time from a property and use it in the query
	addTimeBeforeQuery: function (gr, timeBeforePropertyName, defaultValue) {
		var timeBeforeMin = GlideProperties.get(timeBeforePropertyName, defaultValue);
		if(timeBeforeMin < 0)
			timeBeforeMin = defaultValue;
		var timeBeforeDate = new GlideDateTime();
		timeBeforeDate.addSeconds(-1 * timeBeforeMin * 60);
		gr.addQuery("sys_updated_on", ">", timeBeforeDate);
	},
	
	addNotTheSameSysIdQuery: function (alertGr, currentAlertGr) {
		alertGr.addQuery("sys_id", "!=", currentAlertGr.sys_id);
	},
	
	getCount: function (tableName, gr ) {
		var count = 0;
		var aggAlert = new GlideAggregate(tableName);
		aggAlert.addAggregate('COUNT');
		aggAlert.addQuery(gr.getEncodedQuery());
		aggAlert.query();
        if (aggAlert.next()) {
           count = aggAlert.getAggregate('COUNT');
	    }
		
		return count;
	},
	
	getResultJson: function(count, tableName, type, queryString, timestamp) {
		var resultJson = {};
		resultJson[COUNT] = count;
	    resultJson[TABLE_NAME] = tableName;
	    resultJson[QUERY_STRING] = queryString;
		resultJson[TYPE_NAME] = type;
		if (timestamp) {
			resultJson[CALCULATION_TIME] = timestamp;
		}
		
		return resultJson;
	},
	
	getResultNoQueryJson: function(type) {
		return this.getResultJson("-1", "em_alert_related_task", type, "");
	},
	
	getEmptyJson: function(tableName, type) {
		return this.getResultJson("0", tableName, type, "");
	},
	
	getProcessStateByValue: function(value) {
		switch(value) {
			case IN_PROGRESS_STATE:
				return "In progress";
			case DONE_STATE:
				return "Done";
			case REMOVED_STATE:
				return "Removed";
			case NOT_PROCESSING_STATE:
				return "Not processing";
		}
	},
	
	getAlertId: function(alertId) {
		var alertGr = new GlideRecord("em_alert");
		if (alertGr.get(alertId)) {
			if(alertGr.is_group_alert != null && alertGr.is_group_alert) { //if alert is virtual return the id of the secondary original alert
				return alertGr.getValue("message_key");
			}
		}
		return alertId;
	},
		
	// Get the message key from the alert that create the virtual alert (this is the message key that should be uses in the query)
	getMessageKeyForVirtualAlertQuery: function (currentAlertGr) {
		var alertGr = new GlideRecord("em_alert");
		if(!alertGr.get(currentAlertGr.message_key))
			return null;
		
		return alertGr.message_key;
	},
	
	getGlideRecordForVirtualAlertQuery: function (currentAlertGr) {
		var alertGr = new GlideRecord("em_alert");
		if(!alertGr.get(currentAlertGr.message_key))
		  return null;
    
		return alertGr;
  },
	

    type: 'EmAiInsightCommon'
};
