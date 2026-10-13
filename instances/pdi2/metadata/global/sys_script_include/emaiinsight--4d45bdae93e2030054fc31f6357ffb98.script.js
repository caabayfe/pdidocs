var EmAiInsight = Class.create();
var emAiInsightCommon = new EmAiInsightCommon();
EmAiInsight.prototype = {
	
    initialize: function() {
    	this.slowStepsManager = new SlowStepJSManager();
		this.evtMgmtCommons = new EvtMgmtCommons();
    },
	
getSimilarAlertQuery: function(alertGr, currentAlertGr) {
	
		this.slowStepsManager.setTopic("ML:Get Similarity Alert Query");
		this.slowStepsManager.startStep("EmAiInsight: getSimilarAlertQuery");
		
		var soultionTitle = gs.getProperty("evt_mgmt_similarity_solution_title","ml_x_global_alert_similarity");
		var use_threshold = gs.getProperty("evt_mgmt.similarity_use_threshold",true);
		var similarAlertMaxCount =  gs.getProperty("evt_mgmt.similarity_max_similar_alerts_shown",10);
		
		var options = {"top_n": similarAlertMaxCount, "apply_threshold": use_threshold};

		var solutions = [];
		solutions[0] = soultionTitle;
	    var predictor = new MLPredictor();
	    var info = "";
		var isPredictedSuccessful = false;
	    var sysids = "";
	    var returnArray = [];
	
		try {
			var solutionName =  solutions[0]; 
	        var solution = predictor.findActiveSolution(solutionName);
			if (!solution) 
				return returnArray;
			
			var outcome_array = predictor.getPredictions (currentAlertGr,solution,options);
			
			if (outcome_array == null) {
				return returnArray;
			}
		  
			if (outcome_array.length == 0) {
				return returnArray;
			}
			
			isPredictedSuccessful = true;
			
			for (var i = 0; i < outcome_array.length; i++) {
				var outcomeInstance = outcome_array[i]; 
				if (outcomeInstance.hasPrediction()) {
					var alertNumber = outcomeInstance.predictedValue(); //String //Alert number (do to a bug, this currently return the sys_id)
					var sysId = outcomeInstance.predictedValueSysId(); //sys_id for similarity
					if (currentAlertGr.sys_id == alertNumber) {
						continue;
					}
                   	var confidence = outcome_array[i].confidence(); //: double //similarity score
					sysids = sysids + "," + alertNumber;
					var retJson = {"number": alertNumber, "sys_id": sysId,"confidence":  confidence};
					returnArray.push(retJson);
				} 
			}
			alertGr.addQuery("sys_id","IN",sysids);
			
		}	catch(exception) {
			var err = "Alerts Similarities\n Alert similarities model fail to locat similarities, possible some input fields are empty /n" + exception;
			gs.error(err);
			
		} finally {
			this.slowStepsManager.report();
			if (!isPredictedSuccessful) {
				return returnArray;
			}
			if (this.isDebugEnabled()) 
				gs.error("Alerts Similarities\n" +  this.printReturnedArray(returnArray));
			
			return returnArray;
		}
	
	},
	
	isDebugEnabled: function() {
		return (gs.getProperty('evt_mgmt.log_debug', 'false') == 'true');
	},
	
	printReturnedArray: function(returnArray) {
		var infoString = "";
		for (var i = 0; i < returnArray.length; i++) {
			var arr = returnArray[i];
			infoString = infoString + "   Number     "     + arr.number + 
				                      "   Sys ID     "     + arr.number + 
				                      "   Confidence "     + arr.confidence +"\n";
		}
		return infoString;
    },
	
	// is the domain separation feature active
	isDomainSepActive:function (){
		var domainSeparationActive = 
			GlideProperties.get("glide.sys.domain.partitioning", false); 
		return domainSeparationActive == "true";
	},
	
	// Related Alert tab
	getRelatedAlertQuery: function (alertGr, currentAlertGr) {
        var useMl = String(gs.getProperty("evt_mgmt.similarity_use_ml", true));
        var isDomain = String(this.isDomainSepActive());
        var isMlPluginActive = String(GlidePluginManager.isActive('com.glide.platform_ml'));
        var isEntitledToML = this.checkMLSimilarityEntitlement();
        if (useMl === "true") {
            if (isMlPluginActive === "true") {
                if (isEntitledToML === "true") {
                    if (isDomain === "false") {
                        try {
                            var res = this.getSimilarAlertQuery(alertGr, currentAlertGr);
                            if (res.length > 0) {
                                gs.warn(" Alerts Similarities: Alerts Similarities were calculate by ML alogritm ");
                                return true;
                            }
                        } catch (exception) {
                            gs.error(" Alerts Similarities: Similarities calculations using ML failed, possibly do to empty input fields  " + exception);
                        }
                    }
                }  else {
					this.evtMgmtCommons.addDebugLogNoPrefix("Alerts Similarities: Similarities calculations using ML failed, no ML entitelment ");
				}
            }
        }
		
		gs.warn("Alerts Similarities:  Alerts Similarities were calculated by field comparison "); 
		var cmdbCiClass = currentAlertGr.cmdb_ci.sys_class_name;
		if(GlideStringUtil.nil(cmdbCiClass)) {
			alertGr.addQuery("sys_id", "=", "");
			return false;
		}
		this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: calculate Similar Alerts");
		alertGr.addQuery("cmdb_ci.sys_class_name", "=", cmdbCiClass);
		if(GlideStringUtil.notNil(currentAlertGr.message_key)) {
			alertGr.addQuery("message_key", "!=", currentAlertGr.message_key); // Dont show repeated alerts.
		}
		emAiInsightCommon.addNotTheSameSysIdQuery(alertGr, currentAlertGr);
		emAiInsightCommon.addTimeBeforeQuery(alertGr, "evt_mgmt.alert_insight_alert_history_min", 43200 /* 30 days */);
		this.setSameAsFilter(alertGr, currentAlertGr, "evt_mgmt.alert_insight_alert_same_as_filter", "source,type,resource,metric_name");
		this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: calculate Similar Alerts. Query string: " + alertGr.getEncodedQuery() );
		return false;
	},
	
	checkMLSimilarityEntitlement: function() {
	    var entitlementProperty = gs.getProperty('evt_mgmt.ml_solutions.overwrite_entitlement', 'disable');
	    if (! entitlementProperty === 'disable') {
	        this.evtMgmtCommons.addDebugLogNoPrefix("Alerts Similarities: ML entitlement check is overwritten with the value of " + entitlementProperty);
	        return entitlementProperty;
	    }
	    var result = 'false';
	    try {
	        result = String(new MlValidationHelper().checkEntitlements('similarity_trainer').validation);
	    } catch (exception) {
	        gs.error("Alerts Similarities: MLEntitlementUtil.checkEntitlements raised exception with the message: " + exception);
	    }
	    return result;
	},
	
	// Same Alert tab
	getSameAlertQuery: function (alertGr, currentAlertGr) {
		this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: calculate Repeated Alerts");
		var message_key = "";
		if(currentAlertGr.is_group_alert != null && currentAlertGr.is_group_alert) {
			// For virtual alert we should
			// 1. Find the message key of the secondary alert that create the virtual alert
			// 2. Dont show the secondary alert that create the virtual alert
			this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: calculate Repeated Alerts for virtual group");
			message_key = emAiInsightCommon.getMessageKeyForVirtualAlertQuery(currentAlertGr);
			if(GlideStringUtil.notNil(message_key)) {
				alertGr.addQuery("message_key", "=", message_key);
			}
			alertGr.addQuery("sys_id", "!=", currentAlertGr.message_key);
		}
		if(GlideStringUtil.nil(message_key)) { // this means it is not a virtual alert
			alertGr.addQuery("message_key", "=", currentAlertGr.message_key);
		}
		emAiInsightCommon.addNotTheSameSysIdQuery(alertGr, currentAlertGr);
		emAiInsightCommon.addTimeBeforeQuery(alertGr, "evt_mgmt.alert_insight_alert_history_min", 43200 /* 30 days */);
		this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: calculate Repeated Alerts. Query string: " + alertGr.getEncodedQuery() );
	},
	
	// Same CI task query 
	getSameCiTaskQuery: function (taskGr, currentAlertGr) {
		var cmdbCiSysId = currentAlertGr.cmdb_ci;
		if(GlideStringUtil.nil(cmdbCiSysId)) {
			taskGr.addQuery("sys_id", "=", "");
			return;
		}
		var task = currentAlertGr.incident;
		if(GlideStringUtil.notNil(task)) {
			taskGr.addQuery("sys_id", "!=", task); // Ignore the alert task if exists
		}
		var taskType = taskGr.getTableName();
		this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: calculate CI " + taskType);
		var changeReqResult = this.addSameTaskCondition(taskGr, taskType, cmdbCiSysId);
		var qc = taskGr.addQuery("cmdb_ci", "=", cmdbCiSysId);
		if(changeReqResult.length > 0) 
			qc.addOrCondition('sys_id', "=", changeReqResult);
		emAiInsightCommon.addTimeBeforeQuery(taskGr, "evt_mgmt.alert_insight_task_history_min", 10080 /* 7 days */);
		this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: calculate CI " + taskType + " Query string: " + taskGr.getEncodedQuery() );
	},
	
	addSameTaskCondition: function (taskGr, taskType, cmdbCiSysId) {
		var result = [];
		if(taskType == "change_request" ) {
			// For change request we need to look for the following states Implement:-1, review:0 and closed:3
			taskGr.addQuery("state", "IN", "-1,0,3");
		
			//Get array of CHR of CI affected
			var resultCIAffected = this.getChangeRequestByCI(cmdbCiSysId, "task_ci");
			//Get array of CHR of services impacted
			var resultServicesImpacted = this.getChangeRequestByCI(cmdbCiSysId, "task_cmdb_ci_service");
			result = resultCIAffected.concat(resultServicesImpacted);
		}
		return result;
	},
	getChangeRequestByCI: function (cmdbCiSysId, tableName) {
		
		var gr = new GlideRecord(tableName);
		if (tableName == "task_ci")		//Name of the CI column are different in those tables
			gr.addQuery("ci_item", "=", cmdbCiSysId);
		else if (tableName == "task_cmdb_ci_service")
			gr.addQuery("cmdb_ci_service", "=", cmdbCiSysId);
		var maxTasks = GlideProperties.get("evt_mgmt.alert_insight_max_affected_ci_change_requests", 20);
		gr.setLimit(maxTasks);
		gr.orderByDesc("sys_updated_on");
		gr.query();
		//Check that only tasks that are CHR will return.
		var taskResult =[];
		while (gr.next()) {		
			var taskSysID = gr.getValue("task");
			taskResult.push(taskSysID);
			this.evtMgmtCommons.addDebugLogNoPrefix("taskSysID: " + taskSysID + '\n');
		}
		
		var grCHG = new GlideRecord("change_request");
		grCHG.addQuery('sys_id', 'IN', taskResult);
		grCHG.query();
		var changeReqResult =[];
		while (grCHG.next()) {
			var chrSysID = grCHG.getValue("sys_id");
			changeReqResult.push(chrSysID);
			this.evtMgmtCommons.addDebugLogNoPrefix("chrSysID: " + chrSysID + '\n');
		}
		
		return changeReqResult;
	},
	
	
	getSameCiTaskJson: function (tableName, alertSysId, type) {
		var jsonToReturn = {};
		var currentAlertGr = new GlideRecord("em_alert");
		if(currentAlertGr.get(alertSysId)) {
			var taskGr = new GlideRecord(tableName);
			this.getSameCiTaskQuery(taskGr, currentAlertGr);
			var count = emAiInsightCommon.getCount(tableName, taskGr);
			jsonToReturn = emAiInsightCommon.getResultJson(count, tableName, type, taskGr.getEncodedQuery());
		} else {
			jsonToReturn = emAiInsightCommon.getEmptyJson(tableName, type);
		}
		
		this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: getSameCiTaskJson JSON: " + JSON.stringify(jsonToReturn));
		return jsonToReturn;
	},
	
	getSameAlertsJson: function (tableName, alertSysId, type) {
		var jsonToReturn = {};
		var currentAlertGr = new GlideRecord("em_alert");
		if(currentAlertGr.get(alertSysId)) {
			var alertGr = new GlideRecord(tableName);
			this.getSameAlertQuery(alertGr, currentAlertGr);
			var count = emAiInsightCommon.getCount(tableName, alertGr);
			jsonToReturn = emAiInsightCommon.getResultJson(count, tableName, type, alertGr.getEncodedQuery());
		} else {
			jsonToReturn = emAiInsightCommon.getEmptyJson(tableName, type);
		}
		
		this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: getSameAlertsJson JSON: " + JSON.stringify(jsonToReturn));
		return jsonToReturn;
	},
	
	getRelatedAlertsJson: function (tableName, alertSysId, type) {
		var jsonToReturn = {};
		var currentAlertGr = new GlideRecord("em_alert");
		var isUsingML = false;
		if(currentAlertGr.get(alertSysId)) {
			var alertGr = new GlideRecord(tableName);
			isUsingML = this.getRelatedAlertQuery(alertGr, currentAlertGr);
			var count = emAiInsightCommon.getCount(tableName, alertGr);
			jsonToReturn = emAiInsightCommon.getResultJson(count, tableName, type, alertGr.getEncodedQuery());
		} else {
			jsonToReturn = emAiInsightCommon.getEmptyJson(tableName, type);
		}
		jsonToReturn["isUsingML"] = isUsingML;
		this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: getRelatedAlertsJson JSON: " + JSON.stringify(jsonToReturn));
		return jsonToReturn;
	},
	
	getRelatedTaskResults: function(alertId, dataArr) {
		var alertSysId = emAiInsightCommon.getAlertId(alertId);
		this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: getRelatedTaskResults for alert: " + alertSysId);
		var stateJson = emAiInsightCommon.isDoneCalculating(alertSysId);
		if (stateJson.done) {
			this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: getRelatedTaskResults - done calculating results for alert: " + alertSysId + "; insightStateId: " + stateJson.sysId);
			return emAiInsightCommon.getRelatedTaskQuery(stateJson.sysId, dataArr, stateJson.timestamp);
		} else {
			return emAiInsightCommon.getEmptyTaskQuery(dataArr);
		}
	},
	
	calculateRelatedTaskResults: function(alertId, tasks) {
		var alertSysId = emAiInsightCommon.getAlertId(alertId);
		this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: calculateRelatedTaskResults for alert: " + alertSysId);
		if (emAiInsightCommon.toCalculate(alertSysId)) {
			this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight:  starting to toCalculate insight data for alert: " + alertSysId);
			emAiInsightCommon.calculate(alertSysId, tasks); //run calcultion async
			return true;
		} else {
			//no need to calculate - already in calculation
			return false;
		}
	},
	
  // Get a filter from a property and use its fields for same as queries
  setSameAsFilter: function(gr, currentAlertGr, sameAsFilterPropertyName, defaultValue) {
    var sameAsFilter = GlideProperties.get(sameAsFilterPropertyName, defaultValue);
    if(GlideStringUtil.nil(sameAsFilter))
      return;
    this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: sameAsFilter: " + sameAsFilter);
    var array = sameAsFilter.split(',');
    if(currentAlertGr.is_group_alert != null && currentAlertGr.is_group_alert) {
      // For virtual alert we should
      // 1. Find the sys id of the secondary alert that create the virtual alert
      // 2. query the secondary alert instead of the virtual alert
      this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: calculate same filter for virtual group");
      var secGr = emAiInsightCommon.getGlideRecordForVirtualAlertQuery(currentAlertGr); //find the secondary alert of the primary message key
      if(secGr != null) {
        currentAlertGr = secGr;
		gr.addQuery("message_key", "!=", currentAlertGr.message_key); //filter out alerts with the same message key of the secondary
      }
    }
    for(var i=0; i<array.length; i++ ) {
      var key = array[i];
      if(GlideStringUtil.nil(key))
        continue;
      
      var value = currentAlertGr.getValue(key);
      if(GlideStringUtil.nil(value) || value === "NaN") {
        gr.addNullQuery(key);
        continue;
      }
      
      gr.addQuery(key, "=", value);
    }
  },
	
	getRelatedTaskResultsByType: function(taskGr, currentAlertGr, taskType, secured) {
		secured = (secured === true);

		var alertSysId = currentAlertGr.getUniqueValue();
		if(currentAlertGr.is_group_alert != null && currentAlertGr.is_group_alert) {
			this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: getRelatedTaskResultsByType for virtal primary alert: " + alertSysId);
			alertSysId = currentAlertGr.getValue("message_key");
		}
		
		this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: getRelatedTaskResultsByType for alert: " + alertSysId);
		var stateJson = emAiInsightCommon.isDoneCalculating(alertSysId);
		if (stateJson.done) {
			var insightStateId = stateJson.sysId;
			this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: getRelatedTaskResultsByType - done calculating results for alert: " + alertSysId + "; insightStateId: " + insightStateId);
			var grQueryTask = emAiInsightCommon.getGrQueryByTaskType(insightStateId, taskType);
			if (!secured) {
				taskGr.addEncodedQuery(grQueryTask.getEncodedQuery());
			} else {
				taskGr.addUserEncodedQuery(grQueryTask.getEncodedQuery());
			}
		} else {
			this.evtMgmtCommons.addDebugLogNoPrefix("Alert Insight: getRelatedTaskResultsByType - no results for alert: " + alertSysId);
			taskGr.addQuery("sys_id", "=", "");
		}
	},

    type: 'EmAiInsight'
};
