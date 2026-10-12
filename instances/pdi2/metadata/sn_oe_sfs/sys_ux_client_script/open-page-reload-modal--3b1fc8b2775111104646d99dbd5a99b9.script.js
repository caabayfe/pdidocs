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
    const eventPayload = event.payload || {};
    const {
        trackUsage
    } = imports["sn_oe_sfs.CITelemetry"](api);

    if (eventPayload.eventName === 'PLUGINBUTTON#CLICKED') {
        helpers.modal.open('plugin_page_opened');

        //also track the button click for telemetry
        let {
            key,
            plugin_title,
            link
        } = eventPayload.eventPayload || {};
        let eventName = '';

        switch (key) {
            case 'GET_AWA_PLUGIN':
                plugin_title = {
                    title: helpers.translate('Advanced Work Assignment')
                };
                eventName = 'AWA - Plugin Card - GET AWA Plugin';
                break;
            case 'GET_ITSM_PLUGIN':
                eventName = 'AWA - Plugin Card - GET ITSM Plugin';
                break;
            case 'GET_HRSD_PLUGIN':
                eventName = 'AWA - Plugin Card - GET HRSD Plugin';
                break;
            case 'GET_CSM_PLUGIN':
                eventName = 'AWA - Plugin Card - GET CSM Plugin';
                break;
            case 'GET_AGENT_CHAT_PLUGIN':
                eventName = 'AWA - Plugin Card - GET Agent Chat Plugin';
                break;
            case 'GET_WALKUP_EXPERIENCE_PLUGIN':
                eventName = 'AWA - Plugin Card - GET Walkup Experience Plugin';
                break;
            case 'GET_PERFORMANCE_ANALYTICS_PLUGIN':
                eventName = 'AWA - Plugin Card - GET Performance Analytics Plugin';
                break;
            default:
                break;

        }
        if (eventName) {
            trackUsage(eventName, {
                title: plugin_title.title,
                link: link
            });
        }
    }
}
