/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const getAvailableChannelsDBOutput = api.data.get_available_channels_rest.output;
    if (!getAvailableChannelsDBOutput)
        return;
    const availableChannelsList = [];
    const channelsObj = getAvailableChannelsDBOutput.result;
    for (let channelType in channelsObj) {
        if (!channelsObj[channelType].available || (channelsObj[channelType].classification === "bridge")) {
            delete channelsObj[channelType];
        } else {
            availableChannelsList.push({
                id: channelType,
                label: channelsObj[channelType].label,
                isSelected: false
            });
        }
    }
    api.setState("availableChannelsList", availableChannelsList);
}
