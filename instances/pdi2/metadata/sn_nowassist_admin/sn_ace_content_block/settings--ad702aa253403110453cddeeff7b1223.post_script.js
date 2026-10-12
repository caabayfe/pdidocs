(function(context) {
    try {
        var params = JSON.parse(context.props_details.page_parameters);
        params.t = Date.now();
        context.props_details.page_parameters = JSON.stringify(params);
        context.props_details.telemetryData = {
            event_name: "Settings clicked",
            title: "Settings",
            append_to_payload: {}
        };
        context.label = sn_i18n.Message.getMessage("sn_nowassist_admin", "Settings");
    } catch (e) {
        //gs.error("Unable to set fields for Plugins page in Now assist admin"+JSON.stringify(e));
    }
})(context);
