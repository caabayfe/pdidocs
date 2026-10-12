/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.singleClassSelected) {
        return api.state.attributeData.all.map((x) => x.id);
  }else if(api.state.classFieldAttributes[api.item.value.class_name]){
	    return api.state.classFieldAttributes[api.item.value.class_name].map((x) => x.id);
  }
}
