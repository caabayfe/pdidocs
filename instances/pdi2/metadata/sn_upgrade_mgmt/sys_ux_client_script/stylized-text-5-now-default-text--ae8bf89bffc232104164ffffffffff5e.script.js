/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync('{0} tests could not be analyzed by AI', [api.data.list_controller_2.paginationProps.totalRecordCount]);
}
