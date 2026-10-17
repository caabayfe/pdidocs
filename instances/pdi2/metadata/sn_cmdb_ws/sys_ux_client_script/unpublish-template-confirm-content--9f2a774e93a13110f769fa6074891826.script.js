/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return  helpers.translateSync("{0} will be unpublished and won't be available for use.", api.state.template.name);
}
