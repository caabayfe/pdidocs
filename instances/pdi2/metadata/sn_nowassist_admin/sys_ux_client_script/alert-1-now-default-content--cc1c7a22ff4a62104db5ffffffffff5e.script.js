/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync("With fallback turned off, there are {0} skills utilizing non-compliant model providers.",api.state.nonComplaintSkills.rows.length.toString());
}
