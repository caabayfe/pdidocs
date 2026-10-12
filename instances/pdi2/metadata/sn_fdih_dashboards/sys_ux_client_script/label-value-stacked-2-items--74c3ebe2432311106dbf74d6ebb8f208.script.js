/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return [{"label":helpers.translateSync('Contexts Run'),"value":{"type":"string","value":api.data.label_stacked_total_flows.output[0].value.value}}];
}
