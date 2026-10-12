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
    const shouldReloadPage = item.props_details.soft_reload;
    const isRouteAvailable = item.page_route;
    const hasHTML = /<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i.test(item.title);
    //Added condition to render rich text for html content,
    //in case route is not passed and if module item is marked as external
    if (hasHTML || item.props_details.external_link === 'true' || !isRouteAvailable) {
        return item.props_details.isHidden || shouldReloadPage === 'true';
    } 
    return true;
}
