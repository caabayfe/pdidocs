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
    switch (event.elementId) {
        case 'expand_all':
            api.setState('isEmailCollapsed', false);
            api.setState('isSlackNotificationCollapsed', false);
            api.setState('isSlackChannelCollapsed', false);
            api.setState('isSMSCollapsed', false);
            api.setState('isTeamsCollapsed', false); 
            api.setState('isDexCollapsed', false);
            break;
        case 'collapse_all':
            api.setState('isEmailCollapsed', true);
            api.setState('isSlackNotificationCollapsed', true);
            api.setState('isSlackChannelCollapsed', true);
            api.setState('isSMSCollapsed', true);
            api.setState('isTeamsCollapsed', true);
            api.setState('isDexCollapsed', true)
            break;
    }
}
