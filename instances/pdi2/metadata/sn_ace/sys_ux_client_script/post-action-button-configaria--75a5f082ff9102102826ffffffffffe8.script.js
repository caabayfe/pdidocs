/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const ariaProperties = api.context.props.payload.props_details.aria_properties || {};
  if(typeof(ariaProperties)=='object'){
    return ariaProperties;
  }
	return JSON.parse(ariaProperties);
}
