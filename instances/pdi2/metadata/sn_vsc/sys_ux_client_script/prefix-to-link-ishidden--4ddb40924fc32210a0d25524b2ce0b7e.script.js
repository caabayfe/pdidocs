/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // If prefix, show it, else dont render
  const prefix = api?.item?.value?.prefix;
  return !prefix? true: false;
}
