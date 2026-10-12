/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const { referenceTable, referenceTableLabel } = api.state.breakdownForm.fields.field.details;
	return `${referenceTableLabel} [${referenceTable}]`;
}
