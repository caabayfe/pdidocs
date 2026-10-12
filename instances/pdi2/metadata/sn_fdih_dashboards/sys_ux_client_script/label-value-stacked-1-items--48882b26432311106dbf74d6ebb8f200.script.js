/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return [{"label":helpers.translateSync('IPaaSActionProbes'),"value":{"type":"string","value":api.data.label_stacked_mid_count.output[0].value.value}}];
}
