/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function evaluateProperty({ api, event, imports, helpers }) {
    return !api.state.knowledgeBaseSysId && api.state.showEmptyTemplatePreview;
}
