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
    const {
        customExpProps = null
    } = api.state;
    if (customExpProps) {
        var callToActions = customExpProps.callToActions || [];
        var actionBehavior = null;
        for (var i in callToActions) {
            if (callToActions[i].primary === "true") {
                actionBehavior = callToActions[i].actionBehavior;
            }
        }
        if (actionBehavior) {
            var actionMetadata = {
                actionBehavior: actionBehavior
            };
            api.emit('ON_DRILL_DOWN_ACTION', {
                ...customExpProps,
                actionBehavior: actionBehavior,
                actionMetadata: actionMetadata
            });
        }
        return;
    }
}
