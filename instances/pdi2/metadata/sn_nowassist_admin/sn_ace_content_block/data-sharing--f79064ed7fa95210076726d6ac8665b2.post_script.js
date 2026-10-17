(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'data-sharing',
        params: {}
    };
    context.props_details.telemetryData = {
        event_name: "Data sharing clicked",
        title: "Data sharing",
        append_to_payload: {}
    };
    context.title = sn_i18n.Message.getMessage("sn_nowassist_admin", "Data sharing");
})(context, pageParams);
