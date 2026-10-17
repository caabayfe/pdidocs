/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const channel_type = api.context.props.channel;
    if (channel_type == 'messenger') {
        helpers.navigate.to('channel-self-configured-bot-install',{
            'channelType': channel_type
        });
    }
}
