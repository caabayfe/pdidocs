/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var emptyStateVA= {};
  emptyStateVA.label = api.context.props.errorHeading;
  return JSON.stringify(emptyStateVA);
}
