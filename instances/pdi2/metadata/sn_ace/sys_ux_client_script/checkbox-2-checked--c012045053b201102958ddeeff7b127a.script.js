/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        configureDemoData,
    } = api.context.props.payload;
    const {
        hasDemoData
    } = api.item.value;
    return !(configureDemoData && hasDemoData);
}
