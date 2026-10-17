(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'language-region',
        params: {}
    };
    context.props_details.telemetryData = {
        event_name: "Language and region clicked",
        title: "Language and region",
        append_to_payload: {}
    };
    context.title = sn_i18n.Message.getMessage("sn_nowassist_admin", "Multilingual service");
})(context, pageParams);
