(function(context) {
    context.props_details.link = CIPlugin.AgentChat().getExactPluginLink();
    context.props_details.key = 'GET_AGENT_CHAT_PLUGIN';
    context.props_details.plugin_title = {
        inline_style: "font-weight:16px;",
        title: gs.getMessage('Agent Chat')
    };
    var user = gs.getUser();
    if (gs.hasRole('admin') && !CIPlugin.AgentChat().isActive()) {
        context.props_details.aria = {
            "button": {
                "aria-label": gs.getMessage('Get Agent Chat Plugin button , Opens in new window')
            }
        };
        context.props_details.button_label = 'Get plugin';
    }
    if (CIPlugin.AgentChat().isActive()) {
        context.props_details.text = {
            icon: "circle-check-outline",
            label: "Installed"
        };
    }
})(context);
