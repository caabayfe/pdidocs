/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
  api,
  helpers
}) {
  if (api.context.props.parentScreenId) {
    return api.context.props.subroutes;
  }
  return api.context.props.experience ? api.context.props.experience.routes : [];
}
