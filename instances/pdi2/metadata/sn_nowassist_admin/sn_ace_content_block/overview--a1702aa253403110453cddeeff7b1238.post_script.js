(function(context, pageParams) {
    try {
        var params = JSON.parse(context.props_details.page_parameters);
        params.t = Date.now();
        context.props_details.page_parameters = JSON.stringify(params);
        context.props_details.telemetryData = {
            event_name: "Overview clicked",
            title: "Overview",
            append_to_payload: {}
        };
        context.label = sn_i18n.Message.getMessage("sn_nowassist_admin", "Overview");
    } catch (e) {}
})(context, pageParams);
