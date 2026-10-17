/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

   // When Primary Button of Retention pop-up is clicked, it records the prevChoice to the Current Value set.
   api.setState("prevChoice", api.state.currChoice);
}
