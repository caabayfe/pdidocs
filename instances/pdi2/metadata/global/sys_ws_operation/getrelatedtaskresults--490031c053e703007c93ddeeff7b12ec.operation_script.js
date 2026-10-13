(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var start = new Date().getTime();
	var body = GlideStringUtil.getStringFromStream(request.body.dataStream);
	var jsonArr = JSON.parse(body);
	gs.log("Rest Alert Insight body: " + body);
	
	var emAiInsight = new EmAiInsight();
	var alertSysId = jsonArr.alertSysId;
	if(GlideStringUtil.nil(alertSysId) || typeof(alertSysId) === "undefined") {
		exception=new sn_ws_err.ServiceError().setStatus(400);
		exception.setMessage("alertSysId was not found on the json body");
		throw exception;
	}
	
	var data = jsonArr.data;
	if(GlideStringUtil.nil(data) || typeof(alertSysId) === "undefined") {
		exception=new sn_ws_err.ServiceError().setStatus(400);
		exception.setMessage("data was not found on the json body");
		throw exception;
	}
	var tasks = [];
	for(var i in data) {
		tasks.push(data[i].task);
	}
	emAiInsight.calculateRelatedTaskResults(alertSysId, tasks); //calculate results for related tasks
	var resultJson = emAiInsight.getRelatedTaskResults(alertSysId, data); //get query for related task
	var duration = (new Date().getTime()) - start;
	gs.log("Rest Alert Insight: getRelatedTaskResults: finished in: " + duration + " milliseconds");
	gs.log("Rest Alert Insight: getRelatedTaskResults - return json " + JSON.stringify(resultJson));
	
	return resultJson;
	
})(request, response);
