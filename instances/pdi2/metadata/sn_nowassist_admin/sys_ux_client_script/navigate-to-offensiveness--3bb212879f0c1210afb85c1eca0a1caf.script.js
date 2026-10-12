/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var status = event?.payload?.data?.output;
    var timeStamp = Date.now().toString();
    var previousDetectionImpact = api?.data?.get_detection_impact_1?.output?.detectionImpact;
    var productName = api?.data?.get_product_details_1?.output?.name;
    status = status ? ((previousDetectionImpact === "OFF" || previousDetectionImpact === "") ? "active" : "updated") : "error";
    api.emit('NAV_ITEM_SELECTED', {
        route: 'offensiveness',
        params: {
            'productId': api?.context?.props?.productId,
            'status': status+":"+productName+":"+timeStamp,
            't': Date.now()
        }
    });
}
