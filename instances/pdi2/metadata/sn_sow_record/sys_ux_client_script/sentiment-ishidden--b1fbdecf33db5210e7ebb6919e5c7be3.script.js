/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.context.app && api.context.app.tablesSupportingSentiment && !api.context.app.tablesSupportingSentiment.split(",").includes(api.context.props.table);
}
