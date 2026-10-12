/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
   const { name, fieldValue } = event.payload;
   if (fieldValue.length <= 40) {
       api.setState('currentFieldValue', fieldValue);
   }
}
