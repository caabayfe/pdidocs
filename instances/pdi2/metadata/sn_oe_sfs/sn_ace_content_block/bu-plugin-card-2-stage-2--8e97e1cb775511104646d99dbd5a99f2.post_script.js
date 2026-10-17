(function(context) {
    context.props_details.link = CIPlugin.AwaCsm().getExactPluginLink();
    context.props_details.key = 'GET_CSM_PLUGIN';
    context.props_details.plugin_title = {
        title: gs.getMessage('Customer Service Management (CSM)')
    };
    if (gs.hasRole('admin')) {
        context.props_details.button_label = gs.getMessage('Get plugin');
        context.props_details.aria = {
            "button": {
                "aria-label": gs.getMessage('Get CSM Plugin button , Opens in new window')
            }
        };
    }
})(context);
