/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return [{"label":helpers.translateSync('ECC Messages'),"value":{"type":"string","value":api.data.label_stacked_total_ecc.output[0].value.value}}];
}
