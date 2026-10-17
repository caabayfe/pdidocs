(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'data-overflow-processing',
        params: {}
    };
    context.props_details.telemetryData = {
        event_name: "Data overflow processing clicked",
        title: "Data overflow processing",
        append_to_payload: {}
    };
    context.title = sn_i18n.Message.getMessage("sn_nowassist_admin", "Data overflow processing");
})(context, pageParams);
