/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let isActive = api.item.value.isActive;
  if(api.state.selectAll){
    isActive= true;
  }
	return isActive;
}
