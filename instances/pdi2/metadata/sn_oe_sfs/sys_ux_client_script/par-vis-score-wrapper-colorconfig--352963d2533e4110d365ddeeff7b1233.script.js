/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
 const propsData = api.context.props.payload && api.context.props.payload.props_details;
  if (propsData && propsData.data && propsData.data[0]) {
    if (typeof propsData.data[0].sparklineColor === 'string'){
      try {
        return JSON.parse(propsData.data[0].sparklineColor);
      } catch (e) {
        console.log('[VA] Invalid metrics payload');
      }
    } else 
      return propsData.data[0].sparklineColor;
  }
	return "";
}
