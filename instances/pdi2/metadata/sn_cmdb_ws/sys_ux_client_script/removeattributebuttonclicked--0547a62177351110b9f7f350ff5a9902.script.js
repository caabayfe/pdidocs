/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
   let attributesToCompare = JSON.parse(JSON.stringify(api.state.attributesToCompare));
   attributesToCompare.splice(event.context.item.index,1);
   api.setState('attributesToCompare', attributesToCompare);
   api.setState('isDirty', true); 
   api.emit('CHECK_FORM_STATUS');
}
