(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'privacy-policies',
        params: {}
    };
    context.props_details.telemetryData = {
        event_name: "Privacy policies clicked",
        title: "Privacy policies",
        append_to_payload: {}
    };
    context.title = sn_i18n.Message.getMessage("sn_nowassist_admin", "Data privacy");
})(context, pageParams);
