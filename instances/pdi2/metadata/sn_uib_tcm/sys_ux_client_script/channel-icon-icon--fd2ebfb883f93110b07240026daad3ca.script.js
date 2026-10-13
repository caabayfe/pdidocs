/**
 * @param {params} params 
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var channelIcon;
    switch (api.item.value.channelType.value) {
        case 'e-mail':
            channelIcon = "envelope-outline";
            break;
        case 'sms':
            channelIcon = "cellphone-outline";
            break;
        case 'slack-message':
        case 'slack':
            channelIcon = "slack-outline";
            break;
        case 'ms-teams-message':
            channelIcon = "microsoft-teams-outline";
            break;
        case 'dex-desktop-assistant':
            channelIcon = "laptop-outline";
            break;
    }
    return channelIcon;
}
