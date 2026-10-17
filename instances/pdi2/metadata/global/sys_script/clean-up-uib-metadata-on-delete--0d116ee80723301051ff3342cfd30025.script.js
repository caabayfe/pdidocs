(function executeRule(current, previous /*null when async*/) {
	var screenId = current.getValue('screen');
	var screen = new GlideRecord('sys_ux_screen');
	screen.get(screenId);
	
	var macroponentId = screen.getValue('macroponent');
	var macroponent = new GlideRecord('sys_ux_macroponent');
	macroponent.get(macroponentId);
	
	var appRoutes = new GlideRecord('sys_ux_app_route');
	appRoutes.addQuery('parent_macroponent', macroponentId);
	
	appRoutes.deleteMultiple();
	screen.deleteRecord();
	macroponent.deleteRecord();
})(current, previous);
