(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'manage-llm-providers',
        params: {
            t : Date.now()
        }
    };
    context.props_details.telemetryData = {
        event_name: "Manage AI models clicked",
        title: "Manage AI models",
        append_to_payload: {}
    };
    context.title = sn_i18n.Message.getMessage("sn_nowassist_admin", "Manage AI models");
})(context, pageParams);
