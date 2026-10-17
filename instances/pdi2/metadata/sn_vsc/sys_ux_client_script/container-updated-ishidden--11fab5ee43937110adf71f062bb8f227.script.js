/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var changedValue = api?.data?.bp_details_form?.form?.fields?.changed?.value;
  return !changedValue;
}
