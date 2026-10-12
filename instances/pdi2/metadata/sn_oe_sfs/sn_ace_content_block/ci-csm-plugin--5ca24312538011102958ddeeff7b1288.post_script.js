(function(context) {
    context.props_details.link = CIPlugin.CSM().getPluginLink();
    context.props_details.variant = "primary";
    context.props_details.plugin_title = {
        inline_style: "width:100%;",
        title: gs.getMessage('Customer Service Management (CSM)')
    }
})(context);
