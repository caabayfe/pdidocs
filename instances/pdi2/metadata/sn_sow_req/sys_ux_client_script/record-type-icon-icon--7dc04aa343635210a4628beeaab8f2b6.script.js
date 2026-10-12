/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if(api.context.props.table == "interaction") {
    return api.item.value.type && api.state.interactionType[api.item.value.type];
  }
  return "harddrive-outline";
}
