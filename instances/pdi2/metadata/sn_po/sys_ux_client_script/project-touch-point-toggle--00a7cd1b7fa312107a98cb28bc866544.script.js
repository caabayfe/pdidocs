/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports,
}) {
    const {
        touchPoints,
        selectedEntity,
        processId,
        touchPointsStatus,
    } = api.state;

    let selection = false;
    if ('value' in event.payload) {
        selection = event.payload.value;
    } else {
        // invoked when sync button is clicked by user.
        // If the payload does not exist, treat this as a sync operation.
        selection = true;
    }

    const payload = {
        value: selection,
        entityId: selectedEntity._row_data.uniqueValue,
    };

    if(!processId) {
        payload.fields = "";
        payload.timeRange = "0";
        payload.users = "";
    } else {
        payload.fields = touchPoints.fields.join(',');
        payload.timeRange = touchPoints.timeRange;
        payload.users = touchPoints.users.join(',');
    }

    if (touchPointsStatus && touchPointsStatus.status) {
        api.setState('touchPointsStatus', {
            ...touchPointsStatus,
            status: false,
        });
    }

    api.data.include_touch_point_metrics.execute({
        payload,
    });
}
