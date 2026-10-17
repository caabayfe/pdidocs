/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {itemId, checked} = event.payload;
    api.setState('aggregateSelections', {...api.state.aggregateSelections, [itemId]: checked});
}
