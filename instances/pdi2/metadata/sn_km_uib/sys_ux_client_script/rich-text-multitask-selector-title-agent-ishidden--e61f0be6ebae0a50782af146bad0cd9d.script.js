/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.genAiSourceRecordId == null || api.state.genAiSourceRecordId == '';
}
