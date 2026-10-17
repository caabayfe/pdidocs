/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.item.value.exclude){
    return 'info-circle-outline';
  }else {
    return 'inventory-circle-plus-outline';
  }
}
