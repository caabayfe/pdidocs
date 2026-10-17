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
    try {
        let screenData = api.context.props.payload.children;
        let activeScreen = event.elementId;
        if (screenData) {
            const {
                title,
                subtitle,
                props_details,
                children,
                block_id
            } = screenData[activeScreen];
            const {
                trackUsage
            } = imports["sn_oe_sfs.CITelemetry"](api);
            const pluginCardCB = children.find((block) => {
                return block.type.route == 'ci-plugin-card';
            });
            const {
                key
            } = props_details;
            let eventName = '';
            switch (key) {
                case 'FIX_ABANDONED_TOPICS':
                    eventName = 'CI - CTA Nav - Improve topics to abandoned topics';
                    break;
                case 'FIX_IDLE_TOPICS':
                    eventName = 'CI - CTA Nav - Improve topics to idle topics';
                    break;
                case 'FIX_UNDERPERFORMING_TOPICS':
                    eventName = 'CI - CTA Nav - Improve topics to underperforming topics';
                    break;
                case 'PREBUILT_ITSM_TOPICS':
                    eventName = 'CI - CTA Nav - BU Conversation plugins to ITSM';
                    break;
                case 'PREBUILT_CSM_TOPICS':
                    eventName = 'CI - CTA Nav - BU Conversation plugins to CSM';
                    break;
                case 'PREBUILT_HR_TOPICS':
                    eventName = 'CI - CTA Nav - BU Conversation plugins to HR';
                    break;
                default:
                    eventName = (pluginCardCB) ? 'CI - ' + subtitle + ' CTA Nav - ' + pluginCardCB.title : 'CI - CTA Nav - ' + subtitle;

            }
            if (eventName) {
                trackUsage(eventName, {
                    title: subtitle,
                    label: props_details.description,
                    subtitle: title
                });
            }
            api.setState("activeScreen", activeScreen);
            api.setState("currentScreenData", screenData[activeScreen]);

            api.setState("actionsData", []);
            helpers.timing.setTimeout(function() {
                api.setState("actionsData", screenData[activeScreen].children);
            }, 100);

            api.setState("splitButtonActionData", screenData[activeScreen].splitButtonActionData);
        }
    } catch (e) {

    }
}
