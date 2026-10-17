(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: GlidePluginManager.isActive('com.glide.data_privacy') ? 'privacy-policies' : 'data-sharing',
        params: {
        }
    };
    context.props_details.telemetryData = {
        event_name: "Now Assist Data privacy and processing",
        title: "Data sharing and processing",
        append_to_payload: {}
    };
    context.title = sn_i18n.Message.getMessage("sn_nowassist_admin",  "Data sharing and processing");
})(context, pageParams);
