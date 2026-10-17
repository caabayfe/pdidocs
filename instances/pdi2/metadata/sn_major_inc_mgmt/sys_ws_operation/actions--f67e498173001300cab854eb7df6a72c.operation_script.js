(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	// CONSTANTS
	var TABLE_INCIDENT = 'incident';
	var ATTR_INCIDENT_STATE = "incident_state";
	var ATTR_MAJOR_INCIDENT_STATE = "major_incident_state";
	var ATTR_STATE = "state";
	var ATTR_RESOLVED_BY = "resolved_by";
	var incidentStates = new global.MIMWorkbenchUtil().getAllIncidentStates();

	var incidentSysId = request.pathParams.incidentSysId;
	if (!incidentSysId)
		return new sn_ws_err.BadRequestError("Incident id not provided");

	var incidentGr = new GlideRecord(TABLE_INCIDENT);
	if (!incidentGr.get(incidentSysId))
		return new sn_ws_err.NotFoundError("Requested Incident not found");

	if(request.body.data && request.body.data.action){
		var resObj = {};
		var mim;
		populateGR(incidentGr, request.body.data.record);
		switch(request.body.data.action){
			case 'PROMOTE':
				mim = new sn_major_inc_mgmt.MajorIncidentTriggerRules(incidentGr);
				mim.approveMIC(); // promotes to major, also updates the record
				resObj.result = 'SUCCESS';
				break;
			case 'RESOLVE':
				incidentGr[ATTR_INCIDENT_STATE] = incidentStates.RESOLVED;
				incidentGr[ATTR_STATE] = incidentStates.RESOLVED;
				incidentGr[ATTR_RESOLVED_BY] = gs.getUserID();
				if(incidentGr.update())
					resObj.result = 'SUCCESS';
				break;
			case 'CLOSE':
				incidentGr[ATTR_INCIDENT_STATE] = incidentStates.CLOSED;
				incidentGr[ATTR_STATE] = incidentStates.CLOSED;
				if(incidentGr.update())
					resObj.result = 'SUCCESS';
				break;
			case 'REJECT':
				incidentGr.major_incident_state =  sn_major_inc_mgmt.MajorIncidentTriggerRules.prototype.MAJOR_INCIDENT_STATE.REJECTED;
				if(incidentGr.update()) {
					resObj.result = 'SUCCESS';
					gs.addInfoMessage(gs.getMessage('{0} has been rejected as major incident candidate', incidentGr.getDisplayValue()));
				}
				break;
			case 'REFRESH_IMPACTED_SERVICES':
				new global.CIUtils().refreshImpactedServices(incidentGr);
				resObj.result = 'SUCCESS';
				break;
			case 'CREATE_NEW_MI':
				mim = new sn_major_inc_mgmt.MajorIncidentTriggerRules(incidentGr);
				var parentGr = mim.createParentIncidentFromMIC();
				resObj.parent_incident_sys_id = parentGr.sys_id.toString();
				resObj.result = 'SUCCESS';
				break;
			case 'GENERATE_TIMELINE':
				incidentGr.timeline = new sn_major_inc_mgmt.ConsolidatedIncidentTimeline().getTimeline(incidentGr);
				if(incidentGr.update()){
					resObj.result = 'SUCCESS';
					gs.addInfoMessage(gs.getMessage('Timeline has been regenerated'));
				}
				break;
			default:
				return new sn_ws_err.BadRequestError("Invalid action triggered");
		}
		return resObj;
	} else
		return new sn_ws_err.BadRequestError("Action need to be provided");

	function populateGR(gr, data){
		if(data)
			Object.keys(data).forEach(function(key){
				var element = gr.getElement(key);
				if (element != undefined && element.canWrite()) {
					gr[key] = data[key];
				}
			});
	}
})(request, response);
