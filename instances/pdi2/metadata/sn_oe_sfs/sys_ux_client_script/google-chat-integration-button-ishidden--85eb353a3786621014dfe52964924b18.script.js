/**
 * @param {Object} params
 * @param {Object} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
  const hide_button = api.context.props.channel !== 'google-chat';
  return hide_button;
}
