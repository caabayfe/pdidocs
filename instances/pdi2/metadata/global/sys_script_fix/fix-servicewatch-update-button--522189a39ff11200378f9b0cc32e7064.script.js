var grAction = new GlideRecord('sys_ui_action');
var actionId = "42df02e20a0a0b340080e61b551f2909";
if(grAction.get(actionId) && grAction.table != 'global'){
	grAction.setValue('script','current.update();');
	grAction.setValue('table','global');
	grAction.setValue('sys_mod_count', 16);
	grAction.update();
}
	
