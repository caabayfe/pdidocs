/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var prevPage = api.context.props.prevPage || "";
    return prevPage == "" || prevPage != "security_center";
}
