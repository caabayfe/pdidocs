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
    
    if (eventPayload.eventName === 'CTA_BUTTON_CLICKED#EXTERNAL_URL_NAVIGATION') {
        {
            const {
                subtitle,
                props_details
            } = eventPayload.eventPayload.content_block || {};
            const {
                key,
                link
            } = props_details;
            let eventName = '';

            switch (key) {
                case 'SETUP_SERVICE_CHANNELS':
                    eventName = 'AWA - CTA Card - Configure Service Channels';
                    break;
                case 'SETUP_QUEUES':
                    eventName = 'AWA - CTA Card - Configure Queues';
                    break;
                case 'SETUP_ASSIGNMENT_RULES':
                    eventName = "AWA - CTA Card - Configure Assignment Rules";
                    break;
                case 'CONFIGURE_PRESENCE_STATES':
                    eventName = "AWA - CTA Card - Configure Presence States";
                    break;
                case 'CONFIGURE_REJECTION_REASONS':
                    eventName = "AWA - CTA Card - Configure Rejection Reasons";
                    break;
                case 'DETERMINE_AGENT_CAPACITY':
                    eventName = "AWA - CTA Card - Configure Agent Capacity";
                    break;
                case 'CONFIGURE_ASSIGNMENT_GROUPS':
                    eventName = "AWA - CTA Card - Configure Assignment Groups";
                    break;
                case 'CONFIGURE_AGENT_AFFINITY':
                    eventName = "AWA - CTA Card - Configure Agent Affinity";
                    break;
                case 'CONFIGURE_SHIFT_BASED_ASSIGNMENT':
                    eventName = "AWA - CTA Card - Configure Shift Based Assignment";
                    break;
                default:
                    break;

            }
            if (eventName) {
                trackUsage(eventName, {
                    title: subtitle,
                    link: link
                });
            }
        }
    }
}
