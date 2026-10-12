/**
 * @param {Object} params
 * @param {Object} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
  const channel = api.state.pageParams.channel;

  if (channel === 'teams') {
    return 'Microsoft Teams channel';
  } else if (channel === 'slack') {
    return 'Slack channel';
  } else if (channel === 'workplace') {
    return 'Workplace channel';
  } else if (channel === 'messenger') {
    return 'Messenger channel';
  } else if (channel === 'line') {
    return 'Line channel';
  } else if (channel === 'google-chat') {
    return 'Google Chat channel';
  }
}
