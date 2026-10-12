(function executeRule(current, previous /*null when async*/) {

	var dashboardName = current.name;
	var screenType = current.sys_ux_screen_type;
	var experience = current.experience;
	var screen = current.sys_ux_screen; 
	var screenCollection = current.sys_ux_screen_type;

	if (experience) {
		// is advanced dashboard, update names on related UX tables
		
		var gr = new GlideRecord('sys_ux_app_route');
		gr.addQuery('screen_type',screenType);
		gr.query();
		if (gr.next()) {
			gr.name = dashboardName;
			gr.setWorkflow(false); // don't run other BR
			gr.update();
		}
		
		gr = new GlideRecord('sys_ux_screen_type');
		if (gr.get(screenCollection)){
			gr.name = dashboardName;
			gr.setWorkflow(false); // don't run other BR
			gr.update();
		}
	}

})(current, previous);
