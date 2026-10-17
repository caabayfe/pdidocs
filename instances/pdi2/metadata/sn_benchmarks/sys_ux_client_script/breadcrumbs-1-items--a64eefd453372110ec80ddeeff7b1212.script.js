/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var items = [{
        "label": api.context.props.tabLabel,
        "href": "javascript:void(0);",
        "hideLabel": true
    }, {
        "label": api.context.props.indicatorKpiName,
        "href": "#"
    }];

    return items;
}
