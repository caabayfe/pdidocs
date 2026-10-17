/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // Render the traditional log view, when viewType is not mentioned explicitly
  const viewType = api?.context?.props?.viewType;
  return viewType ? true: false;
}
