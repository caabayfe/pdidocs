/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // const item = api.context.props.item;
    // const shouldReloadPage = item.props_details.page_reload;
    // return item.props_details.isHidden ||
    //     shouldReloadPage !== 'false' ||
    //     (shouldReloadPage === 'false' && item.isActive);

    const item = api.context.props.item;
    const shouldReloadPage = item.props_details.soft_reload;
    return item.props_details.isHidden ||
        shouldReloadPage !== 'true' ||
        (shouldReloadPage === 'true' && item.isActive);
}
