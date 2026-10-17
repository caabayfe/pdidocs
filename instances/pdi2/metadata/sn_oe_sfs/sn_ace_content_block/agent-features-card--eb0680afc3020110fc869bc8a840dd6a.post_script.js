(function(context){
	if(CIPlugin.ConnectSupport().isActive()) {
		var connectSupportLink = '<style>.now-link-set-link.-primary { color: RGB(var(--mv9-jAmU-1tz--XZATrZO--JvjvZ,var(--now-color--secondary-1,1,119,142))); text-decoration: none; } .now-link-set-link.-primary:hover { text-decoration: underline; } </style> <a class=".now-link-set-link.-primary" href="/nav_to.do?uri=%2Fsys_cs_live_agent_setup.do%3Fsys_id%3Df0acbc4c5f091300e6333654de7313c8" target="_blank">{0}<now-icon style="padding-left:3px;" icon="open-link-end-fill" size="md"></now-icon></a>';

		var linkLabel = gs.getMessage('Connect Support settings (previously Chat Setup)');
		context.props_details.footer_description = connectSupportLink.replace('{0}', linkLabel);
	}
})(context);
