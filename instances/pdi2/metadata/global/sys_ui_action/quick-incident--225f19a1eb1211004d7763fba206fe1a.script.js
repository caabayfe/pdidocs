gs.include('EvtMgmtIncidentHandler');

EvtMgmtIncidentHandler.createIncident(current, false);
var gr = new GlideRecord('em_alert');
gr.get(current.sys_id);
if (gr.incident.nil() && gr.remote_task_id.nil()) {
	gs.error("Failed to create incident");
	var errorMsg = gs.getMessage("Failed to create incident");
    gs.addErrorMessage(errorMsg);
	action.setRedirectURL(current.getLink(true));
}
else {
	current.incident = gr.incident;
	current.remote_task_id = gr.remote_task_id;
	current.update();

	if (EvtMgmtIncidentHandler.isRemoteIncidentURLDefined()){
		var urlForIncidents = EvtMgmtIncidentHandler.getRemoteIncidentURL();
		var urlForIncidentsEscaped = GlideStringUtil.escapeHTML(urlForIncidents);
		var urlWithParams = current.getLink(true)+ "&remoteid=" + current.remote_task_id + 
							   "&remoteurl="+ urlForIncidentsEscaped;
		gs.debug("Create Incident in remote system. Open alert URL with params:" +  urlWithParams);
		action.setRedirectURL(urlWithParams);
	}
	else {
	   action.setRedirectURL('incident.do?sys_id=' + current.incident);
	}
}
