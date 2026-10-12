/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
  if(event.elementId === 'back_btn'){
    api.emit('GO_BACK_GUIDANCE');
  }
}
