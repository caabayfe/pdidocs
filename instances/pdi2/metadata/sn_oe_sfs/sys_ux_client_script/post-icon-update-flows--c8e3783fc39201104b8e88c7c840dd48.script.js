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
    if (event.name == 'CI_MENU_ITEM_ACTION' && (event.payload.payload == 'applied' || event.payload.action.name == 'reverted_to_default')) {
        if(event.payload.action == 'reverted_to_default'){
            const updatedIcon = {};
            const { webclientIconsProp, selectedIcon } = api.state;
            const { icon_name } = event.payload.action;
            updatedIcon[icon_name] = null;
            api.setState('webclientIconsProp', { ...webclientIconsProp,
                ...updatedIcon
            });
        }
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'chat_history_settings_alert',
                status: 'positive',
                icon: 'circle-check-fill',
                content: 'Icon change saved successfully.',
                action: {
                    type: 'dismiss'
                }
            }]
        });
        api.setState('webclientDisplayState', null);
        api.setState('highlightIcon', null);
        api.data.ci_branding_settings_helper.refresh();
    }
}
