/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.tableDisplayValue + ' [' + api.context.props.tableName + '] ' + helpers.translateSync('table');
}
