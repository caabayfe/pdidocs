/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return !api.item.value.mappedPresence || api.item.value.mappedPresence == "presence_unknown";
}
