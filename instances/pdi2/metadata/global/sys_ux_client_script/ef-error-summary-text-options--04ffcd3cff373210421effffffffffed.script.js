/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var opts = api.context.props.options || {};
    var result = Object.assign({}, opts);

    var domainPath = api.state.selected_domain_path;
    if (domainPath && domainPath !== "all")
        result.domainPath = domainPath;

    return result;
}
