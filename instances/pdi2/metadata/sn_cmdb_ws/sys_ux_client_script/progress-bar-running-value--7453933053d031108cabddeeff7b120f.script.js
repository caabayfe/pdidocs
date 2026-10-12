/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var total = api.item.value.template_task_count.total;
  var state = api.item.value.template_task_run_state;
  if(total == 0) {
    return 0;
  }
	return (api.item.value.template_task_count.complete) / total;
}
