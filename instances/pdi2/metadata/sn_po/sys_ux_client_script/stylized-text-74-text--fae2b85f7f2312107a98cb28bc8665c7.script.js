/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync('This will enable setting up metrics for the {0} table.', api.state.selectedEntity.table?.displayValue);
}
