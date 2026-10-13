/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let icon;
    switch (api.item.value.channelType.value) {
        case 'e-mail':
            icon = "envelope-outline";
            break;
        case 'sms':
            icon = "cellphone-outline";
            break;
        case 'slack-message':
        case 'slack':
            icon = "slack-outline";
            break;
        case 'ms-teams-message':
            icon = "microsoft-teams-outline";
            break;
        case 'dex-desktop-assistant':
            icon = "laptop-outline";
            break;
    }
    return icon;
}
