/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const item = api.context.props.modules[event.payload.selectedTabIndex];
    if (event?.payload?.isInitialPageLoad) {
        return;
    }
    item.isActive = true;
    const reload =  item.props_details.soft_reload == 'false' ? true : false;
    const fields = !item.props_details.fields ? {} : JSON.parse(item.props_details.fields);
    const params = !item.props_details.page_parameters ? {} : JSON.parse(item.props_details.page_parameters);
    let payload = {
        reload: reload,
        route: item.page_route,
        fields,
        params
    };
    api.emit('NAV_ITEM_SELECTED', payload);
    const telemetryData = item?.props_details?.telemetryData

    if (!telemetryData) {
         return;
    }
    if (telemetryData && telemetryData.disable)
        return;
    let telemetryPayload = {
        title: item.title || ''
    };

    if (telemetryData && telemetryData.append_to_payload) {
        telemetryPayload = {
            ...telemetryPayload,
            ...telemetryData.append_to_payload
        };
    }
    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
        event: telemetryData.event_name || "Module Item Clicked",
        value: {
            telemetryPayload
        }
    });

}
