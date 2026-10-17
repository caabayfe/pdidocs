(function(context, pageParams){
	context.props_details.nav_payload = {
		route: 'plugins',
		params: {
			workflow: "all",
			t: Date.now()
		}
	};
    context.title = sn_i18n.Message.getMessage("sn_nowassist_admin", "Plugins");
})(context, pageParams);
