/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { state: { modalTabs } } = api;
    const { payload, context: { item: { parent } } } = event;
    const updatedModalTabs = [...modalTabs];
    updatedModalTabs[parent.index].fields[payload.name] = payload.value;
    api.setState('modalTabs', updatedModalTabs);
}
