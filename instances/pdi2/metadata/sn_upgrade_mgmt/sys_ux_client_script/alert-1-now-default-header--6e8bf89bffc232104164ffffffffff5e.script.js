/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync('{0} of {1} tests were not analyzed by AI.', [(api.data.list_controller_2.paginationProps.totalRecordCount || 0), (api.data.list_controller.paginationProps.totalRecordCount + api.data.list_controller_2.paginationProps.totalRecordCount || 0)])
}
