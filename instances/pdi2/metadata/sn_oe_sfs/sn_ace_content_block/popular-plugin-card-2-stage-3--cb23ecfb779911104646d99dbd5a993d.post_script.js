(function(context) {
    context.props_details.link = CIPlugin.WalkupExperience().getExactPluginLink();
    context.props_details.key = 'GET_WALKUP_EXPERIENCE_PLUGIN';
    context.props_details.plugin_title = {
        inline_style: 'font-weight:16px;',
        title: gs.getMessage('Walk-up Experience')
    };

    if (gs.hasRole('admin') && !CIPlugin.WalkupExperience().isActive()) {
        context.props_details.button_label = gs.getMessage('Get plugin');
        context.props_details.aria = {
            "button": {
                "aria-label": gs.getMessage('Get Walkup Experience Plugin button , Opens in new window')
            }
        };
    }
    if (CIPlugin.WalkupExperience().isActive()) {
        context.props_details.text = {
            icon: 'circle-check-outline',
            label: gs.getMessage('Installed')
        };
    }
})(context);
