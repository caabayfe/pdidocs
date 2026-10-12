(function executeRule(current, previous /*null when async*/) {

	gr = new GlideRecord('sys_ux_app_route');
	gr.addQuery('screen_type',current.sys_ux_screen_type);
	gr.query();
	while(gr.next())
		gr.deleteRecord();
	
	var gr = new GlideRecord('sys_ux_macroponent');
	if (gr.get(current.sys_ux_macroponent))
		gr.deleteRecord();
	
	gr = new GlideRecord('sys_ux_screen');
	if (gr.get(current.sys_ux_screen))
		gr.deleteRecord();
	
	gr = new GlideRecord('sys_ux_screen_type');
	if (gr.get(current.sys_ux_screen_type))
		gr.deleteRecord();

})(current, previous);
