/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.data.task_detail_record.result && api.data.task_detail_record.result.number) {
  	return helpers.translateSync(api.data.task_detail_record.result.number.displayValue);
  }
  return '';
}
