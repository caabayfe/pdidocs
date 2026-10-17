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
    let previousStatus = api.state.changeTypes;
    let currentStatus = api.data.service_map_is_changed.output;

    if (api.state.isFirstTime) {
        api.setState("isFirstTime", false);
        return;
    }

    if (!currentStatus || !currentStatus.types || !previousStatus || !previousStatus.types)
        return;

    for (const [key, value] of Object.entries(currentStatus.types)) {
        if (value !== previousStatus.types[key]) {
            // Raise changed type event
            api.emit('APP_SERVICE_EXT#CHANGE_TYPE_CHANGED', {
                changeType: key,
                changeTypeValue: value
            });
        }
    }

    }
