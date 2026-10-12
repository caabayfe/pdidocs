/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.projectData.miningSummary?.statusMessage != '' && api.state.projectData.miningSummary?.warnings?.length === 0 ? false : true;
}
