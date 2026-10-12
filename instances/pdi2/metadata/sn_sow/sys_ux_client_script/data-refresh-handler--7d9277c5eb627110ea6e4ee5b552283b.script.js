/**
 * Data Refresh Handler
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const payload = {
        name: event.name,
        elementId: event.elementId,
        payload: event.payload
    };

    if (payload.payload.name == "listRefresh") {
        const { list, timestamp } = payload.payload.value;
        if (list == "requests") {
            api.data.sow_team_mgmt_lookup_requests.refresh();
        } else if (list == "teams") {
            api.data.sow_team_mgmt_data_broker.refresh();
        } else {
            api.data.sow_team_mgmt_lookup_requests.refresh();
            api.data.sow_team_mgmt_data_broker.refresh();
        }
        return;
    }

    // only reload data if the prop change is one of the inbound props.
    // without the filter, Page property change was also triggering on the 
    // Output Prop Mapping changes
    //
    // this whitelist should match the controllers props
    const whitelist = ["filter", "searchTerm", "rowLimit", "currentPage"];
    if (whitelist.includes(payload.payload.name)) {
        api.setState("onCallData", { init: true });
        api.data.sow_team_mgmt_data_broker.refresh();
    }
}
