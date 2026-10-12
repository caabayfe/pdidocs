/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.showNonComplaintSkills ? "chevron-up-fill" : "chevron-down-fill";
}
