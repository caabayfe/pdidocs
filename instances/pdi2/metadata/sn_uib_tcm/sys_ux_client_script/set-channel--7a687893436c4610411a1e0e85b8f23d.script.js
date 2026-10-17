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
    const selectedType = api.state.selectedType;
    let selectedChannel = event.payload.item.id;
    const currSelectedChannel = api.state.selectedChannel;
    if (selectedChannel == currSelectedChannel) return;
    let channelErrors = [];
    const channels = api.data.get_remaining_channels.output.channels;
    for (let i = 0; channels && selectedType == "collaboration" && i < channels.length; i++) {
        if (selectedChannel == channels[i].type) {
            if (channels[i].hideForRecurringCommTask) {
                selectedChannel = null;
                channelErrors = [{
                    status: "critical",
                    content: await helpers.translate("You can't add collaboration chat channels (e.g. Microsoft Teams chat, Sidebar discussion) to a communication task with recurring frequency. If you want to add such channels, change the task frequency to one-time."),
                    icon: "circle-exclamation-outline"
                }];
            }
            break;
        }
    }
    api.setState("selectedChannel", selectedChannel);
    api.setState("channelErrors", [...channelErrors]);
}
