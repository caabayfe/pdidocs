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
    api.setState("showLoader", true);
    let selectedChannel = api.state.selectedChannel;
    const channelsData = api.data.get_remaining_channels.output.channels;
    let channelTable;
    let fieldValues = "comm_task=" + api.context.props.sysId;
    for (let i = 0; i < channelsData.length; i++) {
        let channelData = channelsData[i];
        if (channelData.type == selectedChannel) {
            channelTable = channelData.inst_table;
            if (selectedChannel == "sms") fieldValues += "^notify_sms_template=" + channelData.default_sms_template_id;
            if (selectedChannel == "e-mail") fieldValues += "^email_client_template=" + channelData.default_email_template_id;
            if (selectedChannel == 'dex-desktop-assistant') fieldValues += "^dex_desktop_assistant_notification_template=" + channelData.default_dex_template_id;
            break;
        }
    }
    api.setState("channelTable", channelTable);
    api.data.create_record.execute({
        table: channelTable,
        templateFields: fieldValues
    });
}
