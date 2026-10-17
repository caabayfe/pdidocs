/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var state = api.item.value.template_run_state;
  if(state == 'complete'){
    return 'positive';
  }else if(state == 'complete_with_errors') {
    return 'orange';
  }else if(state == 'failed') {
    return 'error';
  }
	return 'gray';
}
