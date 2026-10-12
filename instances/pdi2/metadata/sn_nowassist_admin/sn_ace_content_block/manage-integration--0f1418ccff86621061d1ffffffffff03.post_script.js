(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'manage-integration',
        params: {}
    };
    context.props_details.telemetryData = {
        event_name: "Manage Integration",
        title: "Manage Integration",
        append_to_payload: {}
    };
    context.title = sn_i18n.Message.getMessage("sn_nowassist_admin", "Manage Integration");
})(context, pageParams);
