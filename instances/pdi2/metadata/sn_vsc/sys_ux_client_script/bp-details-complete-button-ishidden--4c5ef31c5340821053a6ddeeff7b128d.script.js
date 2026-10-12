/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    var bp_status = api?.data?.bp_details_form?.form?.fields?.status?.value;
    return (bp_status === 'completed');
}
