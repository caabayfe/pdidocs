/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // If the insight has not been acknowledged yet, we should render read icon
  const isRemoved = api?.item?.value?.isRemoved;
  return !isRemoved;
}
