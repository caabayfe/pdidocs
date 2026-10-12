/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return `${api.data.record_3.form.fields.sys_scope.displayValue}: `;
}
