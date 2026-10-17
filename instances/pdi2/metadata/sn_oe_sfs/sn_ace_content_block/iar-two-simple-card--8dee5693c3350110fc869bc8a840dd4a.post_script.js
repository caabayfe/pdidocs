(function(context) {
    context.props_details.highlight = CIPlugin.IAR().isActive() ? false : true;
    context.props_details.display = "flex";
    context.props_details.flex_direction = "column";
})(context);
