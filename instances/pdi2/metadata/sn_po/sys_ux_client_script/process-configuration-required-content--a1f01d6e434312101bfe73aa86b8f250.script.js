/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync('A process configuration with the process details and recommendations setup sections completed is required to enable recommendations for the {0} table.', api.state.selectedEntity?.table?.displayValue);
}
