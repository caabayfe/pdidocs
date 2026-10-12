/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
		return api.state.automatedIds.length > 15 ? helpers.translateSync('A maximum of 15 Automated improvement opportunity definitions are allowed.') : helpers.translateSync('Apply to project');
}
