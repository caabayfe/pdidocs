/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (event.payload.fieldValue < 0 || event.payload.fieldValue > 100) {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "alert6",
                status: "critical",
                icon: "circle-close-outline",
                content: "Inference Percent should be between 0 and 100",
                action: {
                    type: "dismiss"
                }
            }]
        });
    } else {
        api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
            items: [{
                id: "alert6"
            }]
        });

        api.emit('RECORD_PAGE_TABS#GFORM_SET_VALUE_RELAY', {
            fieldName: "inference",
            value: event.payload.fieldValue
        });
    }
}
