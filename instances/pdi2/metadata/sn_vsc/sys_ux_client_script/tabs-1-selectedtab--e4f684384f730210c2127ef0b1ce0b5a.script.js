/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var selectedTab = api?.context?.props?.selectedTab[0] || '';
  return selectedTab;
}
