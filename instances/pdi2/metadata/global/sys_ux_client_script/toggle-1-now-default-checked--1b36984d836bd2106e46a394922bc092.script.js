/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {

  var auditStatus = api.data.record_3.form.fields.audit.value == "true" ? api.state.auditcurr: api.state.auditprev;
	return auditStatus;
}
