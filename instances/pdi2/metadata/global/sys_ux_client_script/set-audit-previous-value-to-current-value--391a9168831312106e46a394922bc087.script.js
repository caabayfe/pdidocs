/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

  // When Primary Button of Audit pop-up is clicked, it records the auditprev to the Current Value of Audit.
  // Performing DB update further
  api.setState("auditprev", api.state.auditcurr);
  api.data.update_record_1.execute({
    table: "sys_dictionary",
    recordId : api.data.record_3.sysId,
    templateFields: "audit=" + api.state.auditcurr,
    useSetDisplayValue: false
  });
}
