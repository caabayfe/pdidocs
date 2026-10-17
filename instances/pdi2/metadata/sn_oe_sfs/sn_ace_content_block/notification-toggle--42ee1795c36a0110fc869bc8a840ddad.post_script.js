(function(context){
	if(gs.getCurrentApplicationId() !== 'global') {
		context.props_details.disabled = true;
	} else {
		context.props_details.tooltip_text = '';
		context.props_details.aria_props = {
			'aria-label': gs.getMessage('Toggle Chat client notifications')
		};
	}
	
	var notificationEnabled = false;
	var chatSetupGr = new GlideRecord('sys_cs_live_agent_setup');
	if(chatSetupGr.get('f0acbc4c5f091300e6333654de7313c8')) {
		notificationEnabled = chatSetupGr.getValue('notification_enabled');
		notificationEnabled = (notificationEnabled == "1");
	}
	
	context.props_details.checked = notificationEnabled;
})(context);
