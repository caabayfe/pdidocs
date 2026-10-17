/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var itemsChanged = api.state.itemsChanged;
    itemsChanged.push(event.payload.item);
    api.setState('itemsChanged', itemsChanged);
}
