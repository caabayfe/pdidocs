/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.searchDisabled)
    return  [{"status":"suggestion","icon":"circle-info-outline","content": api.state.searchNotAvailableText}];
  return [];
}
