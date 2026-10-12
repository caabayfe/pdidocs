/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var val =  {
    label: helpers.translateSync('Details will be available once all de-duplication tasks have been calculated'), 
    variant: 'secondary', 
    style: 'italics'};
  if(api.item.value.template_task_count.total == 0) {
    return val;
  }else {
    return '';
  }
}
