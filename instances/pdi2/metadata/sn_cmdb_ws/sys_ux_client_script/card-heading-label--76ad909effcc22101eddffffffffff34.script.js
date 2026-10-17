/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync("CMDB Health for {0} CIs",api.state.selectedLabel);
}
