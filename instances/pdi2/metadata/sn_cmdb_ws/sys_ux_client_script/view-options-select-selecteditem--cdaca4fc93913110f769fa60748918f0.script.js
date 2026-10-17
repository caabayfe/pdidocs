/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let libraries = api.data.deduplication_template_get_all_libraries.output.result;
	return libraries[0].id;
}
