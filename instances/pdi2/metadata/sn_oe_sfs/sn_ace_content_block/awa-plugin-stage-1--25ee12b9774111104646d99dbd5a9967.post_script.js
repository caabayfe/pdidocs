(function(context) {
    context.props_details.link = CIPlugin.AWA().getExactPluginLink();
    context.props_details.key = 'GET_AWA_PLUGIN';
    context.props_details.aria = {
        "button": {
            "aria-label": gs.getMessage('Get AWA Plugin button , Opens in new window')
        }
    };
})(context);
