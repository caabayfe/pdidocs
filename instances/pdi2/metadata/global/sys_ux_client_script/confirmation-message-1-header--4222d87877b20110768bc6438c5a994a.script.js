/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if (api.context.props.status == "success"){ 
    return api.state.success; 
  }
  return api.state.failure;
}
