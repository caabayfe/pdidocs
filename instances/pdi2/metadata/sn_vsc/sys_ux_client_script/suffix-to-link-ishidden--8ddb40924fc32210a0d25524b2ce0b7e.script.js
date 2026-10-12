/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // If suffix, show it, else dont render
  const suffix = api?.item?.value?.suffix;
  return !suffix? true: false;
}
