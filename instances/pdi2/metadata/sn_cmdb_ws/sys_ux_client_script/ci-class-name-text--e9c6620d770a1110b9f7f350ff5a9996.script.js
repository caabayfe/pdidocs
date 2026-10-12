/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {

	return (api.state.classLookup[api.item.value.class_name] ? api.state.classLookup[api.item.value.class_name] : api.item.value.class_name);
}
