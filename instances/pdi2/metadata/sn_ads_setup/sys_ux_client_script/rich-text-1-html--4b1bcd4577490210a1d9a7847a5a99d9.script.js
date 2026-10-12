/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.guidance.checklist && helpers.translateSync(api.state.guidance.checklist) || '';
}
