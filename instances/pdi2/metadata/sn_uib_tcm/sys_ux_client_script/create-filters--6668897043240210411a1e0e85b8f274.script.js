/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const output = api.data.get_remaining_channels.output;
    if (!output) return;
    const channels = output.channels;
    const isCollaborateAvailable = output.isCollaborateAvailable;
    const commTaskType = output.commTaskType;
    if (!channels) return;
    let channelTypesFilter = [{
        id: "communication",
        label: await helpers.translate("Communication")
    }];
    let collabChannelsFilter = [];
    let commChannelsFilter = [];
    let commChannelAvlbl = false,
        numOfCollabChannels = 0;
    for (let i = 0; i < channels.length; i++) {
        let channel = channels[i];
        if (channel.classification == "update") {
            commChannelAvlbl = commChannelAvlbl || channel.canCreate;
            commChannelsFilter.push(getChannelObj(channel));
        }
        if (channel.classification == "bridge") {
            numOfCollabChannels += channel.available ? 1 : 0;
            collabChannelsFilter.push(getChannelObj(channel));
        }
    }
    if (isCollaborateAvailable) channelTypesFilter.push({
        id: "collaboration",
        label: await helpers.translate("Collaboration")
    });
    api.setState("channelTypesFilter", [...channelTypesFilter]);
    api.setState("collabChannelsFilter", [...collabChannelsFilter]);
    api.setState("commChannelsFilter", [...commChannelsFilter]);
    api.setState("commTaskType", commTaskType);
    api.setState("numOfCollabChannels", numOfCollabChannels);
    let emptyStateType = "";
    if ((!commChannelAvlbl && commTaskType == "communication") || (numOfCollabChannels == 1 && isCollaborateAvailable && commTaskType == "collaboration")) emptyStateType = commTaskType;
    api.setState("emptyStateType", emptyStateType);
    if (channelTypesFilter.length == 1) api.setState("selectedType", channelTypesFilter[0].id);
    api.setState("showLoader", false);

    function getChannelObj(channel) {
        return {
            id: channel.type,
            label: channel.label,
            disabled: !channel.canCreate,
            hideForRecurringCommTask: channel.hideForRecurringCommTask
        };
    }
}
