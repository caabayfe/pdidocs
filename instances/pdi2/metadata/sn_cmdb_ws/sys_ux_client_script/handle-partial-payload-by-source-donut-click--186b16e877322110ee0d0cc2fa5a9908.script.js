/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    if (!event.payload || event.payload.type != 'NOW_VIS_WRAPPER#CLICKED') {
        return;
    }

    const selectedDiscoverySource = event?.payload?.payload?.data?.elements[0];
    const sourceCount = event?.payload?.payload?.data?.value;
    const aggregateLimit = api.data.get_partial_payload_item_category_limit.output.data.GlideRecord_Query.sn_cmdb_ws_feature_category_metadata._results[0].aggregate_limit.value;
    const showExceedLimitInfo = sourceCount > aggregateLimit;
    let exceedLimitInfoText = await helpers.translate("Only up to {0} partial payloads per discovery source appear in this list view to minimize performance impact. Partial payload with same discovery source, class and error combination are not displayed.", aggregateLimit);

    const customPayload = {
        route: "partial-payloads",
        targetRoute: "current",
        params: {
            query: selectedDiscoverySource === undefined ? '' : 'discovery_source=' + selectedDiscoverySource,
            extraParams: {
                showExceedLimitInfo: showExceedLimitInfo,
                exceedLimitInfoText: exceedLimitInfoText
            }
        }
    };

    api.emit('NAV_ITEM_SELECTED', customPayload);
}
