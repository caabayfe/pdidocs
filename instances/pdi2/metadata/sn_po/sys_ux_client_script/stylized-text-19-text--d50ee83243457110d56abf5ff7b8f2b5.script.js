/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.projectData?.miningSummary?.totalRecordsMined){
	return helpers.translateSync("Number of records mined: {0}",api.state.projectData.miningSummary.totalRecordsMined)
  }
}
