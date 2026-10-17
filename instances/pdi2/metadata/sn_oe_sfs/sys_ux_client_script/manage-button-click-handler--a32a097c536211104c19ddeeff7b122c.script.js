/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        eventName,
        eventPayload
    } = event.payload;

    if (eventName == 'OPEN_MANAGE_INTEGRATIONS_PAGE') {
        helpers.navigate.to('va-channel-integrations',{
            channel : eventPayload.content_block.props_details.channel_type
        });
    }
}
