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
    const TRANSLATION = {
        MESSAGE: await helpers.translate('Message'),
        TO: await helpers.translate('To'),
        TITLE: await helpers.translate('Title'),
    };

    var channelRecipientsObj = {};
    const result = api.data.get_comm_task_channel_details.output.data;
    const teamsChannel = result && result['ms-teams-message'];
    const slackNotificationData = result && result['slack-message'];
    const slackChannelData = result && result['slack'];
    const smsChannel = result && result['sms'];
    const emailChannel = result && result['email'];
    const dexChannel = result && result['dex_desktop_assistant'];
    
    const populateRecipients = (channel, channelkey, channelRecipients) => {
        if (channel && channel.available) {
            let usersList = [],
                groups = [],
                recipientLists = [];

            for (let key in channelRecipients) {
                let recipient = channelRecipients[key];
                if (recipient['type'] === 'sys_user_group')
                    groups.push(recipient.id);
                else if (recipient['type'] === 'sn_publications_recipients_list')
                    recipientLists.push(recipient.id);
                else // get channels api does not return type similar to look up api, so need to consider remaining items as users
                    usersList.push(recipient.id);
            }
            return {
                'users': usersList,
                'groups': groups,
                'recipientLists': recipientLists
            };
        }
    };

    let alerts = 0;
    async function fieldsRequired(channel, field, fieldValue){
        if(!fieldValue || (typeof fieldValue === "string" ? fieldValue.trim().length === 0 : fieldValue.length === 0)){
            alerts += 1;
            var content = await helpers.translate('{0} - {1} field is required', channel, field);
            var items = [{
                "action": {
                "type": "dismiss"
                },
                "content": content,
                "icon": "circle-close-outline",
                "id": `comm-task-${channel}-${field}-required`,
                "status": "critical",
            }];
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: items,
            });
        }
    };

    if (teamsChannel && teamsChannel.available) {
        fieldsRequired('Teams', TRANSLATION.MESSAGE, api.state.teamsConfig.teamsMessage);
        fieldsRequired('Teams', TRANSLATION.TO, api.state.teamsConfig.teamsUsers);
    }

    if (slackNotificationData && slackNotificationData.available) {
        fieldsRequired('Slack notification', TRANSLATION.MESSAGE, api.state.slackNotificationConfig.message);
        fieldsRequired('Slack notification', TRANSLATION.TO, api.state.slackNotificationConfig.users);
    }

    if (slackChannelData && slackChannelData.available) {
        fieldsRequired('Slack', TRANSLATION.MESSAGE, api.state.slackChannelConfig.message);
    }
    
    if (smsChannel && smsChannel.available) {
        fieldsRequired('SMS', TRANSLATION.MESSAGE, api.state.smsConfig.message);
        fieldsRequired('SMS', TRANSLATION.TO, api.state.smsConfig.selectedRecipients);
    }

    if (dexChannel && dexChannel.available) {
        fieldsRequired('DEX Desktop Assistant', TRANSLATION.TITLE, api.state.currentDexTitle);
        fieldsRequired('DEX Desktop Assistant', TRANSLATION.MESSAGE, api.state.currentDexMessage);
        fieldsRequired('DEX Desktop Assistant', TRANSLATION.TO, api.state.dexChannelConfig.users);
    }

    api.setState("fieldsFilled", (alerts == 0));

    channelRecipientsObj['teams'] = populateRecipients(teamsChannel,'teams', api.state.teamsConfig.teamsUsers);
    channelRecipientsObj['slack'] = populateRecipients(slackNotificationData,'slack', api.state.slackNotificationConfig.users);
    channelRecipientsObj['sms'] = populateRecipients(smsChannel,'sms', api.state.smsConfig.selectedRecipients);
    channelRecipientsObj['email'] = emailChannel;
    channelRecipientsObj['dex_desktop_assistant'] = populateRecipients(dexChannel, 'dex_desktop_assistant', api.state.dexChannelConfig.users);
    
    api.setState('recipientObj', {
        'channelRecipeints' : channelRecipientsObj,
        'commTaskTable': api.context.props.commTaskTable,
        'commTaskId': api.context.props.sysId
    });
}
