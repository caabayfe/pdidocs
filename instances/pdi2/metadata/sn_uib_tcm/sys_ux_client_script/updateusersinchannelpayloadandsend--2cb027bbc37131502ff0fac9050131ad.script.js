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
    const result = api.data.get_comm_task_channel_details.output.data;
    const teamsChannel = result && result['ms-teams-message'];
    const slackNotificationData = result && result['slack-message'];
    const slackChannelData = result && result['slack'];
    const smsChannelData = result && result['sms'];
    const emailData = result && result['email'];
    const dexData = result && result['dex_desktop_assistant'];

    const recipients = api.data.get_users_from_groups_and_recipient_lists.output;
    var channelsPayload = { ...api.state.channelsPayload
    };
    const populateChannelPayload = (channelData, channelName, channelKey, message) => {
        let channelPayload = channelData;
        let recipientList = [];
        let channelRecipients = recipients[channelKey] ? recipients[channelKey] : [];
        for (let i = 0; i < channelRecipients.length; i++) {
            recipientList.push({
                'id': channelRecipients[i]
            });
        }

        channelPayload['recipients'] = recipientList;
        channelPayload['message'] = message;
        channelPayload['name'] = channelName;
        if (channelName == 'dex_desktop_assistant')
            channelPayload['title'] = api.state.currentDexTitle;
        return channelPayload;
    };

    if (teamsChannel && teamsChannel.available)
        channelsPayload['ms-teams-message'] = populateChannelPayload(teamsChannel, 'ms-teams-message', 'teams', api.state.teamsConfig.teamsMessage);
    if (slackNotificationData && slackNotificationData.available)
        channelsPayload['slack-message'] = populateChannelPayload(slackNotificationData, 'slack-message', 'slack', api.state.slackNotificationConfig.message);

    if (slackChannelData && slackChannelData.available) {
        let slackPayload = slackChannelData;
        slackPayload['message'] = api.state.slackChannelConfig.message;
        slackPayload['name'] = 'slack';
        channelsPayload['slack'] = slackPayload;
    }

    if (smsChannelData && smsChannelData.available) {
        const smsContacts = recipients["sms"];
        let smsConfig = api.state.smsConfig;
        channelsPayload['sms'] = {
            "from": smsConfig.from,
            "message": smsConfig.message,
            "toNumbers": smsContacts
        };
    }

    if (dexData && dexData.available) {
        channelsPayload['dex_desktop_assistant'] = populateChannelPayload(dexData, 'dex_desktop_assistant', 'dex_desktop_assistant', api.state.currentDexMessage);
    }

    if (emailData && emailData.available) {
        channelsPayload['email'] = emailData;
    }

    if (api.state.fieldsFilled)
        api.setState('channelsPayload', channelsPayload);

    if (api.state.fieldsFilled) {
        api.setState('sendId', 'send' + api.state.sendCount); //Triggering email send
        api.setState('sendCount', api.state.sendCount + 1); //updating send count
    }

    if (!emailData && api.state.fieldsFilled && !dexData) {
            api.data.send_comm_updates.
            execute({
                "commTaskSysId": api.context.props.sysId,
                "table": api.context.props.table,
                "payload": JSON.stringify(channelsPayload)
            });
    }
}
