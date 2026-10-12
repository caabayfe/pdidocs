/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var buttonId = event.elementId;
    var onDemandMetaJson = api.state.onDemandMetaJson;
    
    api.setState(onDemandMetaJson[buttonId][0], !api['state'][onDemandMetaJson[buttonId][0]]);
    api.setState(onDemandMetaJson[buttonId][1], !api['state'][onDemandMetaJson[buttonId][1]]);

}
