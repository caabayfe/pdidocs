/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, imports, helpers }) {
    const payloadValue = event && event.payload && event.payload.value;
    const templateId = (payloadValue && payloadValue[0] && payloadValue[0][0]) 
        ? payloadValue[0][0] 
        : api.state.template;
    api.setState("template", templateId || null);
    api.setState("selectedTemplate", [[templateId]]);
    helpers.timing.setTimeout(function() {
    api.data.kb_processor.refresh();
}, 200);
}
