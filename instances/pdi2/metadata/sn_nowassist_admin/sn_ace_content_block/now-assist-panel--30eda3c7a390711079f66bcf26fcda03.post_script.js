(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'now-assist-panel',
        params: {}
    };
	context.props_details.telemetryData = {
		event_name : "Now Assist Panel clicked",
		title : "Now Assist Panel",
		append_to_payload : {}
	};
	context.title = sn_i18n.Message.getMessage("sn_nowassist_admin", "Now Assist panel");
})(context, pageParams)
