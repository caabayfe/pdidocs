/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (!(event.payload.data.output)) {
        let extraParam = `selectedTabIndex//defaultTab//query/${api.state.selectedFilter}/parentTable/${api.context.props.table}/parentRecordSysId/${api.context.props.sysId}`;
        let redirectPayload = {
            "redirect": true,
            "route": "record",
            "targetRoute": "current",
            "fields": {
                "table": api.state.selectedTable,
                "sysId": "-1"
            },
            "params": {
                "query": api.state.selectedFilter,
                "extraParams" : extraParam
            },            
        };
        api.emit("NAV_ITEM_SELECTED", redirectPayload);
    } else {
        //get SD select translation params; hardcoding payload for relatedService
        const sdPayloadUtil = imports['sn_csm_case_types.serviceDefinitionSelectorPayloadUtil']();
        const sdPayload = await sdPayloadUtil.getRelatedServiceForm(api.state.selectedTable, api.context.props.sysId, helpers);
        let payload = {
            "fields": {
                "table": api.context.props.table,
                "sysId": api.context.props.sysId
            },
            "params": sdPayload,
            "size": "xl"
        };
        api.emit("NAV_SERVICE_DEF_SELECTOR", payload);
    }
}
