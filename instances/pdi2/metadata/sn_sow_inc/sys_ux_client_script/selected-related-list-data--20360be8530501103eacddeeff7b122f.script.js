/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { payload } = event;
    let selectedRelatedListData = {
        relatedListName: payload.relatedListName,
        count: payload.model.layoutQuery.count,
        timestamp: payload.timestamp
    };
    api.setState("selectedRelatedListData", selectedRelatedListData);
}
