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
    const isRouteAvailable = item.page_route;
    const shouldReloadPage = item.props_details.soft_reload;
    const hasHTML = /<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i.test(item.title);
    return item.props_details.isHidden || shouldReloadPage === 'true' || hasHTML == true || item.props_details.external_link === 'true' || !isRouteAvailable;
}
