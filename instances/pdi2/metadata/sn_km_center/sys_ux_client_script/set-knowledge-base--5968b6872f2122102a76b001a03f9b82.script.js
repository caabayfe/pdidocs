/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var kb = '';
    if(api.state && api.state.interceptorExtraParams && api.state.interceptorExtraParams["kb-knowledge-base"]) {
        kb = event.payload.value[0] ? event.payload.value[0][0]: api.state.knowledgeBaseSysId;
    } else {
        kb = event.payload.value[0] ? event.payload.value[0][0]:'';
        api.setState("template", null);
        api.setState("selectedTemplate", []);
        api.setState("articlePreview", null);
        api.setState("showEmptyTemplatePreview",false);

    } 
    api.setState("knowledgeBaseSysId", kb);
    api.setState("selectedKnowledeBase", [[kb]]);

}
