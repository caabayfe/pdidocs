/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const selectedvariants = {...api.state.selectedvariant};
    const eventItem = event.payload.item;

    selectedvariants[eventItem.exp] = eventItem.id;

    api.setState('selectedvariant', selectedvariants);
}
