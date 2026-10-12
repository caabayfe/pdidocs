/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var table = api.state.tableDisplayValue + ' [' + api.context.props.tableName + ']';
  var allTablesStr = helpers.translateSync("All tables");
	return `[{\"label\":\"${allTablesStr}\",\"href\":\"javascript:void(0)\"},{\"label\":\"${table}\",\"href\":\"#\"}]`;
}
