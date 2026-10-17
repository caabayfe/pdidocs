/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var tabType = api.context.props.tabType;
  var ariaLabel = (tabType == "Communicate") ? helpers.translateSync("Filter to only see communications from certain communication plans") 
  : (tabType == "Collaborate") ? helpers.translateSync("Filter to only see collaborations from chats or calls") : "";
  return {
    "aria-label": ariaLabel
  };
}
