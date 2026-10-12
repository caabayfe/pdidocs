(function(context) {
    context.props_details.link = CIPlugin.AwaHrsd().getExactPluginLink();
    context.props_details.key = 'GET_HRSD_PLUGIN';
    context.props_details.plugin_title = {
        title: gs.getMessage('HR Service Delivery (HRSD)')
    };
    if (gs.hasRole('admin')) {
        context.props_details.button_label = gs.getMessage('Get plugin');
        context.props_details.aria = {
            "button": {
                "aria-label": gs.getMessage('Get HR Service Delivery Plugin button , Opens in new window')
            }
        };
    }

})(context);
