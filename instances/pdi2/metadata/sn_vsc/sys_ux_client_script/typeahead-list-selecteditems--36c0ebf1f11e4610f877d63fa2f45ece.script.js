/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // The expected default value if undefined will let the user choose values, otherwise the component generates array on the fly only if there is a selected value.\
  return api?.item?.value?.selected_value;
}
