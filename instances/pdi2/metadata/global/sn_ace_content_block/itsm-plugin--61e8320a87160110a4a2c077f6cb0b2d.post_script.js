(function(context) {
	context.props_details.app_scope = 'sn_itsm_va';
	context.props_details.plugin_home_url = 'sn_itsm_va';
	if(GlidePluginManager.isActive("sn_itsm_va")){
		context.props_details.plugin_name = 'Set up Issue Auto Resolution for ITSM';
		context.props_details.image = '/images/ITSM2.png';
	}
	else if (GlidePluginManager.isUpgradeSystemBusy() || !SNC.UpdateMutex.isAvailable()) {
		context.subtitle = gs.getMessage('System is busy installing an application');
		context.props_details.button_label = ''; // hides Install button
		context.props_details.image = '/images/permissions.png';
	}
	else{
		context.props_details.plugin_name = 'ITSM Virtual Agent Conversations';
		context.props_details.image = '/images/permissions.png';
	}
})(context);
