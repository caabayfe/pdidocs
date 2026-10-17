(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'write-with-now-assist',
        params: {}
    };
    context.props_details.telemetryData = {
        event_name: "Now Assist context menu clicked",
        title: "Now Assist context menu",
        append_to_payload: {}
    };
	context.title = sn_i18n.Message.getMessage("sn_nowassist_admin", "Now Assist context menu");
})(context, pageParams)
