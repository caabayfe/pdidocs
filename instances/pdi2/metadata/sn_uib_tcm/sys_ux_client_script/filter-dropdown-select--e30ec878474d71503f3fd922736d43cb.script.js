/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
  var tabType = api.context.props.tabType;
  if (tabType === "Communicate") return "multi";
  else if (tabType === "Collaborate") return "single";
}
