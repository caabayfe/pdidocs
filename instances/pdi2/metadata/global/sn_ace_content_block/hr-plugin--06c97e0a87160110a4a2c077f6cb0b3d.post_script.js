(function(context) {
	context.props_details.app_scope = 'sn_iar_hr';
	context.props_details.plugin_home_url = 'sn_iar_hr';
	if(GlidePluginManager.isActive("sn_iar_hr")){
		context.props_details.plugin_name = 'Set up Issue Auto Resolution for HR';
		context.props_details.image = '/images/HR.png';
	}
	else if (GlidePluginManager.isUpgradeSystemBusy() || !SNC.UpdateMutex.isAvailable()) {
		context.subtitle = gs.getMessage('System is busy installing an application');
		context.props_details.button_label = ''; // hides Install button
		context.props_details.image = '/images/permissions.png';
	}
	else{
		context.props_details.plugin_name = 'HR Service Delivery Virtual Agent Conversations';
		context.props_details.image = '/images/permissions.png';
	}
})(context);
