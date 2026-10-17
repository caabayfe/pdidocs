/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var selectedTab = api.context.props.selectedTab;
  if (selectedTab && selectedTab.indexOf("details") !== -1) {
    return "id=details";
  } else {
    return "id=scores";
  }
}
