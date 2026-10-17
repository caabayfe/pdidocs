/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const item = api.context.props.item;
    const className = item.isActive ? 'active' : '';

    if (className == 'active') {
        return {
            "border-bottom": "2px solid white",
            "box-sizing": "border - box",
            "cursor": "pointer",
            "display": "flex",
            "flex - direction": "column",
            "height": "100 %",
            "opacity": "1",
            "width": "100 %"
        };
    }
    return {
        "box-sizing": "border - box",
        "cursor": "pointer",
        "display": "flex",
        "flex-direction": "column",
        "height": "100 %",
        "opacity": ".8",
        "width": "100 %"
    };
}
