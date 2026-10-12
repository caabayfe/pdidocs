/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var categories = api.context.props.categories;
    var label = api.context.props.categories[0].label;
    if (api.context.props.categoryViewport) {
        var category = categories.find(o => o.id === api.context.props.categoryViewport);
        label = category.label;
    }

    return helpers.translateSync('No data collected for the KPIs in {0} category.', label);
}
