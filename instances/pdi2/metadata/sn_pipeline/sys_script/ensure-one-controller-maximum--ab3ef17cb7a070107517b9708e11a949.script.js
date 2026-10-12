(function executeRule(current, previous /*null when async*/ ) {
	//Return early if current is not being created as a controller 
	//Or current is not being updated to be a controller
    if (!current.is_controller || (previous && previous.is_controller)) {
        return;
    }	
	
    var gr = new GlideRecord('sn_pipeline_environment');
    gr.addQuery("is_controller", true);
    gr.addQuery("sys_id", "!=", current.sys_id);
    gr.query();
	
	//Return early if there are no other controllers found
    if (!gr.next()) {
        return;
    }

    gs.addErrorMessage(gs.getMessage('The {0} environment is already configured as the controller instance. Only one environment can be configured as the controller. To set this environment as the controller, first uncheck the Is Controller flag on the {0} environment. ', GlideStringUtil.escapeHTML(gr.name)));
    current.setAbortAction(true);

})(current, previous);
