/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return api?.item?.value?.model_id + "," + api?.item?.value?.column_name + "," + api?.item?.value?.source_table;
}
