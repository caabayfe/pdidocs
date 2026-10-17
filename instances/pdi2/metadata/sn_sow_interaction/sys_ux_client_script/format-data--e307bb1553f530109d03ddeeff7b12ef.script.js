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
    const getIcon = (type) => {
        switch (type.toUpperCase()) {
            case 'CHAT':
                return 'chat-outline';
            case 'PHONE':
                return 'phone-outline';
            case 'MESSAGING':
                return 'cellphone-outline';
            case 'MICROSOFT_TEAMS_CHAT':
                return 'microsoft-teams-outline';
            case 'WALKUP':
                return 'user-outline';
            case 'VIDEO':
                return 'video-chat-outline';
            case 'TEAMS_CALL':
                return 'microsoft-teams-outline';
            case 'ZOOM_CHAT':
                return 'zoom-outline';
            default:
                return 'ongoing-outline';
        }
    };

    let interactionsList = [];
    if (api.state.openedForSysId != -1) {
        for (let i = 0; i < api.data.look_up_records.results.length; i++) {
            const iter = api.data.look_up_records.results[i];
            let cardBody = iter.sys_updated_on.displayValue;
            if (iter.short_description.displayValue !== '')
                cardBody = iter.sys_updated_on.displayValue + ' . ' + iter.short_description.displayValue;
            interactionsList.push({
                number: iter.number.displayValue,
                sysId: iter._row_data.uniqueValue,
                shortDescription: iter.short_description.displayValue,
                updatedOn: iter.sys_updated_on.displayValue,
                type: iter.type.displayValue,
                typeIcon: getIcon(iter.type.value),
                cardBodyText: cardBody,
                typeValue: iter.type.value
            });
        }
    }
    api.setState('interactionsList', interactionsList);
}
