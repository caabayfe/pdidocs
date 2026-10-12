(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'manage-model-versions',
        params: {}
    };
    context.props_details.telemetryData = {
        event_name: "Version management clicked",
        title: "Version management",
        append_to_payload: {}
    };
    context.title = sn_i18n.Message.getMessage("sn_nowassist_admin", "Version management");
})(context, pageParams);
