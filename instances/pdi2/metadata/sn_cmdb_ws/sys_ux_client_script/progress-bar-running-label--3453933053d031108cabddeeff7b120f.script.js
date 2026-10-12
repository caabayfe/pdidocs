/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var state = api.item.value.template_task_run_state;
    if(state == 'draft'){
        return 'Calculating';
    }
	return api.item.value.template_task_count.complete + '/' + api.item.value.template_task_count.total;
}
