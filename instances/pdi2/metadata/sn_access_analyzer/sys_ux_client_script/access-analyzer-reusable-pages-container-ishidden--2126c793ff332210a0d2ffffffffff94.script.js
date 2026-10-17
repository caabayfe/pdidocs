/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // Render the reusable results pages, if viewType is passed explicitly
  const viewType = api?.context?.props?.viewType;
  return viewType ? false: true;
}
