/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('currentTaxonomy', api.data.controller.selectedTaxonomy);
    api.setState('currentTopics', api.data.controller.selectedTopics);

}
