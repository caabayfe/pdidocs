(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var start = new Date().getTime();
	var ALERT_HISTORY_MIN_PROPERTY = "evt_mgmt.alert_insight_alert_history_min";
	var TASK_HISTORY_MIN_PROPERTY = "evt_mgmt.alert_insight_task_history_min";

    var body = GlideStringUtil.getStringFromStream(request.body.dataStream);
	var jsonArr = JSON.parse(body);
	gs.log("Rest Alert Insight : getInsight: body: " + body);
	
	var emAiInsight = new EmAiInsight();
	var alertSysId = jsonArr.alertSysId;
	if(GlideStringUtil.nil(alertSysId) || typeof(alertSysId) === "undefined") {
		exception=new sn_ws_err.ServiceError().setStatus(400);
		exception.setMessage("alertSysId was not found on the json body");
		throw exception;
	}
	
	var jsonArrToReturn = [];
	var data = jsonArr.data;
	for(var i in data)
	{
		var tableName = data[i].tableName;
		var insightType = data[i].insightType;
		var functionName = data[i].functionName;
			 
		gs.log("Rest Alert Insight: getInsight: function: " + functionName + " ;tableName: " + tableName + " ;alertSysId: " + alertSysId + " ;insightType: " + insightType);
		var jsonObj = emAiInsight[functionName](tableName, alertSysId, insightType);
		if(GlideStringUtil.notNil(jsonObj) && typeof(jsonObj) !== "undefined") {
			gs.log("jsonObj: " + JSON.stringify(jsonObj));
		} else {
			gs.log("Rest Alert Insight: the function: " + functionName + " return NULL " );
			jsonObj = emAiInsight.getEmptyJson(tableName, insightType);
		}
		
		jsonArrToReturn.push(jsonObj);
	}
	
	var tasks = jsonArr.tasks;
	var resultRelatedTaskJson = emAiInsight.getRelatedTaskResults(alertSysId, tasks);
	gs.log("Rest Alert Insight: getInsight: getRelatedTaskResults - return json " + JSON.stringify(resultRelatedTaskJson));
	
	var alertHistoryMinValue = gs.getProperty(ALERT_HISTORY_MIN_PROPERTY, "43200");
	var taskHistoryMinValue = gs.getProperty(TASK_HISTORY_MIN_PROPERTY, "10080");
	var jsonToReturn = {};
	jsonToReturn[ALERT_HISTORY_MIN_PROPERTY] = alertHistoryMinValue;
	jsonToReturn[TASK_HISTORY_MIN_PROPERTY] = taskHistoryMinValue;
	jsonToReturn["cards"] = jsonArrToReturn;
	jsonToReturn["tasks"] = resultRelatedTaskJson;
	var duration = (new Date().getTime()) - start;
	gs.log("Rest Alert Insight: getInsight: finished in: " + duration + " milliseconds");
	gs.log("Rest Alert Insight: getInsight: return json " + JSON.stringify(jsonToReturn));
	return jsonToReturn;

})(request, response);
