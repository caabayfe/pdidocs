(function executeRule(current, previous /*null when async*/) {

	var appRouteSysId = current.sys_id;
	var dashboardName = current.name;
	var appConfig = current.app_config;
	var screenType = current.screen_type;

	// if is a route from the advanced dashboard experience
	if (appConfig == '02dc36706f01011089060168e25b3691') {
		// is an advanced dashboard
		var gr = new GlideRecord('sys_ux_screen');
		gr.addQuery('screen_type', screenType);
		gr.query();
		if (gr.next()){	
			// update dashboard name in par_dashboard table
			var grDashboard = new GlideRecord('par_dashboard');
			grDashboard.addQuery('sys_ux_macroponent', gr.macroponent);
			grDashboard.query();
			if (grDashboard.next()) {
				// update the dashboard name
				grDashboard.setValue('name',dashboardName);
				grDashboard.update();			
			}
		}
	}
	

})(current, previous);
