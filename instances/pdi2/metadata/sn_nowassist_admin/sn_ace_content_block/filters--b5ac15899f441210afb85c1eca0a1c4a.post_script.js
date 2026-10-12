(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'filters',
        params: {}
    };
    context.props_details.telemetryData = {
        event_name: "Filters clicked",
        title: "Filters",
        append_to_payload: {}
    };
    context.title = sn_i18n.Message.getMessage("sn_nowassist_admin", "Filters");
})(context, pageParams);
