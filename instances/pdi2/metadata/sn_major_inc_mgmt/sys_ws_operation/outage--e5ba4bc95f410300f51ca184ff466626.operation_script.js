(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // Validation of call
	var incidentSysId = request.pathParams.incidentSysId;
	if (!incidentSysId) 
		return new sn_ws_err.BadRequestError("Incident id not provided");
	
	var incidentGr = new GlideRecord('incident');
	if (!incidentGr.get(incidentSysId))
		return new sn_ws_err.NotFoundError("Requested Incident not found");
	
	var outage = new GlideRecord("cmdb_ci_outage");
	var taskOutage = new GlideRecord('task_outage');
	if (outage.canCreate() && taskOutage.canCreate()) {
		outage.cmdb_ci = incidentGr.cmdb_ci;
		outage.task_number = incidentSysId;
		var outageID = outage.insert();
		if (outageID) {
			taskOutage.task = incidentSysId;
			taskOutage.outage = outageID;
			taskOutage.insert();
		}
		else {
			return new sn_ws_err.BadRequestError("unable to create.");
		}
	}
	else {
		return new sn_ws_err.BadRequestError("User do not have enough permissions to create an outage.");
	}
	
	return outageID;

})(request, response);
