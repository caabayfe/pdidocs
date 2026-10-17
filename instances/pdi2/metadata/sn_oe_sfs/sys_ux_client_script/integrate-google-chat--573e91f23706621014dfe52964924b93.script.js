/**
 * @param {Object} params
 * @param {Object} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
  const channel_type = api.context.props.channel;
  if (channel_type === 'google-chat') {
    helpers.navigate.to('channel-self-configured-bot-install', {
      channelType: channel_type
    });
  }
}
