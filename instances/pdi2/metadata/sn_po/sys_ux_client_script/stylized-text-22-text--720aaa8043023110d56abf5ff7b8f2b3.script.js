/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	  if (api.state.projectData?.findingSummaryStatusMap?.successCount > 0) {
        return helpers.translateSync('Finding definition(s) generated improvement opportunities within the project')
    } else {
        return helpers.translateSync('No improvement opportunities generated within the project')
    }
}
