/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (!event.payload)
        return;
    const channelName = event.payload.name;
    const isChannelSelected = event.payload.value;
    let selectedChannelsList = [...api.state.selectedChannelsList];
    const channelIndex = selectedChannelsList.findIndex(function(channel) {
        return (channel === channelName);
    });
    if (isChannelSelected && (channelIndex === -1)) {
        selectedChannelsList.push(channelName);
    } else if (!isChannelSelected && (channelIndex >= 0)) {
        selectedChannelsList.splice(channelIndex, 1);
    }
    api.setState("selectedChannelsList", selectedChannelsList);
}
