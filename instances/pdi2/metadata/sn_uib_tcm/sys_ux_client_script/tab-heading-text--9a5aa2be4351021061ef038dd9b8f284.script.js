/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let tabType = api.context.props.tabType;
    if (tabType.toUpperCase() == 'COMMUNICATE')
        return helpers.translateSync('Communications');
}
