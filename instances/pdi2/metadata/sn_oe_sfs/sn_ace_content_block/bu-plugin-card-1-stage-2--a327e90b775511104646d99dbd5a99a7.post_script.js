(function(context) {
    context.props_details.link = CIPlugin.AwaItsm().getExactPluginLink();
    context.props_details.key = 'GET_ITSM_PLUGIN';
    context.props_details.plugin_title = {
        title: gs.getMessage('IT Service Management (ITSM)')
    };
    if (gs.hasRole('admin')) {
        context.props_details.button_label = gs.getMessage('Get plugin');
        context.props_details.aria = {
            "button": {
                "aria-label": gs.getMessage('Get IT Service Management Plugin button , Opens in new window')
            }
        };
    }

})(context);
