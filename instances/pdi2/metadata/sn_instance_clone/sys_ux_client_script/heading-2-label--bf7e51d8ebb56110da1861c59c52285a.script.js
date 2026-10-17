/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return 'Edit ' +api.data.clone_get_list_header_1.output.header;
}
