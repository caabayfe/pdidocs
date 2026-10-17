/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.item && api.item.value.isValid===true){
    return [{
    content : 'Please ensure that the timers are set in ascending order (L1 < L2 < L3) and try again.',
    status : 'critical',
    icon : 'circle-exclamation-outline'
    }];
  }
}
