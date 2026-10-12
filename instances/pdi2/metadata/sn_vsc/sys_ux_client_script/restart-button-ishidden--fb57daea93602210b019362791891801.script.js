/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var status = api?.data?.cu_details_form?.form?.fields?.up_update_status?.value;
  return !status || status != 'acknowledged';
}
