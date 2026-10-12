var allowBackgroundRun = 
	(gs.getProperty('svc.recalculate.ui_action.run_in_background', 'false') === 'true');

if (allowBackgroundRun) {
	var serviceId = new ServiceMappingSanitizeIdAPI().sanitizeIdString(current.sys_id);

    var script = "var gr = new GlideRecord('cmdb_ci_service_calculated');";
    script += "if(gr.get('" + serviceId + "')){";
    script += "new global.ServiceCalculationDispatcher('INTERACTIVE').dispatch(gr); }";

	var ts_now = new GlideDateTime();
    GlideRunScriptJob.scheduleScript(script, 'Recalculate Service', ts_now);
	
	//sending a value to UI to display user message. On each action trigger, a different value is set to re-open the message 
	gs.getSession().putClientData('sm_recalc_srv_bg', ts_now.toString());
} else { //default
    new global.ServiceCalculationDispatcher('INTERACTIVE').dispatch(current);
}

var uri = action.getGlideURI() + "";
if (uri.indexOf("_list.do") == -1) {
    action.setRedirectURL(current);
}
