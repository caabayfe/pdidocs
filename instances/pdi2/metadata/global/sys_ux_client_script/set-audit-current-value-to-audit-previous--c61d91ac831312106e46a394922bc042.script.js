/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

  // When Secondary button of Audit Pop-up is clicked , it sets the auditcurr to the previous value of audit.
  // It reverts the value back to previous one
  api.setState("auditcurr", api.state.auditprev);

}
