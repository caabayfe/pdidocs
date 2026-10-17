/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

  // When Secondary button of Retention Pop-up is clicked , it sets the currChoice to the previous value of retention.
  // It reverts the value back to previous one
  api.setState("currChoice", api.state.prevChoice);
}
