(function(context) {
    context.props_details.display = "flex";
    context.props_details.flex_direction = "column";
    if (!CIPlugin.TopicRecommender().isActive()) {
        context.props_details.highlight = true;
    } else {
        context.props_details.highlight = false;
    }
})(context);
