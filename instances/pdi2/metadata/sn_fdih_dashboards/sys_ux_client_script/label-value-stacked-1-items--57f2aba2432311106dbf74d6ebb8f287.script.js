/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return [{"label":helpers.translateSync('Errored Contexts'),"value":{"type":"string","value":api.data.label_stacked_error_contexts.output[0].value.value}}];
}
