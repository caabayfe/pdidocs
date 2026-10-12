(function() {
    var incidentGr = new GlideRecord('incident');
	var incidentSysId = options.sys_id;
	var incidentUtils = new global.IncidentUtils();

	if (!incidentSysId && $sp.getParameter('table') == 'incident')
		incidentSysId = $sp.getParameter('sys_id');

	if (!incidentSysId && $sp.getParameter('table') == 'universal_request') {
		var urGr = new GlideRecord('universal_request');
		urGr.get($sp.getParameter('sys_id'));
		incidentSysId = urGr.primary_task + "";
	}

	/* Actions - Start */
    if (input && input.action == 'resolveIncident' && incidentGr.get(incidentSysId) && hasPermissions(incidentGr, "write") && incidentUtils.canResolveIncident(incidentGr)) {
        incidentGr.incident_state = global.IncidentState.RESOLVED;
		incidentGr.state = global.IncidentState.RESOLVED;
		incidentGr.resolved_by = gs.getUserID();
		data.isIncidentResolved = incidentGr.update();
    }

	if (input && input.action == 'reopenIncident' && incidentGr.get(incidentSysId) && hasPermissions(incidentGr, "write") && incidentUtils.canReopenIncident(incidentGr)) {
        incidentGr.incident_state = global.IncidentState.IN_PROGRESS;
		incidentGr.state = global.IncidentState.IN_PROGRESS;
		data.isIncidentReopened = incidentGr.update();
		gs.addInfoMessage(gs.getMessage("Request reopened"));
    }

	if (input && input.action == 'closeIncident' && incidentGr.get(incidentSysId) && hasPermissions(incidentGr, "write") && incidentUtils.canCloseIncident(incidentGr)) {
		incidentGr.incident_state = global.IncidentState.CLOSED;
		incidentGr.state = global.IncidentState.CLOSED;
		data.isIncidentClosed = incidentGr.update();
    }

   /* Actions - End */

	/* Load incident data */
    if (incidentGr.get(incidentSysId) && hasPermissions(incidentGr)) {
        data.canResolve = (incidentGr.getValue("caller_id") == gs.getUserID()) && incidentUtils.canResolveIncident(incidentGr);
        data.canReopen = incidentUtils.canReopenIncident(incidentGr);
        data.canClose = incidentUtils.canCloseIncident(incidentGr);
        data.showActions = data.canResolve || data.canReopen || data.canClose;
    }

    function hasPermissions(gr, operation) {
        if (operation == "read" && gr.canRead())
            return true;

        if (operation == "write" && gr.canWrite())
            return true;

        return (gr.getValue("caller_id") == gs.getUserID()) || (gr.getValue("opened_by") == gs.getUserID());
    }
    data.i18n = {};

})();
