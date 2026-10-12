(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'offensiveness',
        params: {
            t : Date.now()
        }
    };
    context.props_details.telemetryData = {
        event_name: "Offensiveness clicked",
        title: "Offensiveness",
        append_to_payload: {}
    };
	context.title = sn_i18n.Message.getMessage("sn_nowassist_admin", "Offensiveness");
})(context, pageParams);
