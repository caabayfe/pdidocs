(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'offensiveness',
        params: {
            t : Date.now()
        }
    };
    context.props_details.telemetryData = {
        event_name: "Now Assist Guardian clicked",
        title: "Now Assist Guardian",
        append_to_payload: {}
    };
    context.title = sn_i18n.Message.getMessage("sn_nowassist_admin", "Now Assist Guardian");
})(context, pageParams);
