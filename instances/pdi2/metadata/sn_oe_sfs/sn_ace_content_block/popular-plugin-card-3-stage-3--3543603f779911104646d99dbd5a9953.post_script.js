(function(context) {
    context.props_details.link = CIPlugin.AWAPerformanceAnalytics().getExactPluginLink();
    context.props_details.key = 'GET_PERFORMANCE_ANALYTICS_PLUGIN';
    context.props_details.plugin_title = {
        inline_style: 'font-weight:16px;',
        title: gs.getMessage('Performance Analytics')
    };
    var user = gs.getUser();
    if (gs.hasRole('admin') && !CIPlugin.AWAPerformanceAnalytics().isActive()) {
        context.props_details.button_label = gs.getMessage('Get plugin');
        context.props_details.aria = {
            "button": {
                "aria-label": gs.getMessage('Get Performance Analytics Plugin button , Opens in new window')
            }
        };
    }
    if (CIPlugin.AWAPerformanceAnalytics().isActive()) {
        context.props_details.text = {
            icon: 'circle-check-outline',
            label: gs.getMessage('Installed')
        };
    }
})(context);
