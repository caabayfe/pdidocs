/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var actionConfigurations = api.context.props.actionConfigurations;
    if (typeof actionConfigurations === "string") {
        actionConfigurations = JSON.parse(actionConfigurations);
    }
    const noEventSupportedActionConfigurations = getNoEventSupportedActionConfigurations(actionConfigurations);

    function getNoEventSupportedActionConfigurations(actionConfigurations) {
        for (let key in actionConfigurations) {
            if (actionConfigurations.hasOwnProperty(key)) {
                let config = actionConfigurations[key].configuration;
                // Check if 'eventSupported' is present
                if (config.hasOwnProperty('eventSupported')) {
                    // Set 'eventSupported' to false
                    config.eventSupported = false;
                }
            }
        }
        return actionConfigurations;
    }
    return noEventSupportedActionConfigurations;
}
