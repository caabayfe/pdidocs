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
    imports
}) {
    var output = event?.payload?.data?.output;
    var previousStatus = api?.data?.get_data_overflow_processing_value_1?.output?.toString();
    if (output !== "error" && output !== previousStatus) {
        if (output === "true" || output === true) {
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "data_overflow_opt_in_alert",
                    status: "positive",
                    icon: "circle-check-outline",
                    content: {
                        type: "html",
                        value: await helpers.translate("Turned on. Data overflow processing on external datacenters is now enabled.")
                    },
                    action: {
                        type: 'dismiss'
                    }
                }]
            });
        } else {
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "data_overflow_opt_out_alert",
                    status: "info",
                    icon: "circle-info-outline",
                    content: {
                        type: "html",
                        value: await helpers.translate("Turned off. You’ve opted out of data processing and bursting.")
                    },
                    action: {
                        type: 'dismiss'
                    }
                }]
            });
        }
    } else {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "data_overflow_processing_error_alert",
                status: "critical",
                icon: "circle-exclamation-outline",
                content: {
                    type: "html",
                    value: await helpers.translate("Some error occurred while performing the action.")
                },
                action: {
                    type: 'dismiss'
                }
            }]
        });
    }
}
