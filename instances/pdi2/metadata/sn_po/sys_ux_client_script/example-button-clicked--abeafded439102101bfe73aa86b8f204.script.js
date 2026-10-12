/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('selectedExample', event.elementId);
    helpers.modal.open("[component-id$='improvement_opp_example']");
}
