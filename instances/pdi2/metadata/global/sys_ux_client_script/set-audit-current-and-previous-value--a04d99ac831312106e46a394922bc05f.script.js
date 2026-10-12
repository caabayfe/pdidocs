/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

   // Updating both with the initial value of Audit
   api.setState("auditprev", api.data.record_3.form.fields.audit.value);
   api.setState("auditcurr", event.payload.value);
 
}
