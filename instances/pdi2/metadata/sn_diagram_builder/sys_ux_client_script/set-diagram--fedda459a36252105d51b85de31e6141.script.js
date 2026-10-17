/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    //if diagram is readOnly, setting input to readOnly
    if(event.payload.diagram.isModelReadOnly){
        api.setState("diagramReadOnly", true);
    }
    api.setState('diagram',event.payload.diagram);
}
