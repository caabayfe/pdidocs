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
    const {
        SUCCESS_NOTIFICATION_PROPS,
        ERROR_NOTIFICATION_PROPS
    } = imports["sn_cmdb_ws.cmdbWSAttestationUtil"]();

    api.data.get_smart_detection_state.refresh();
    if (event && event.payload && event.payload.data && event.payload.data.output && event.payload.data.output.result) {
        const {
            action,
            ciCount,
            error
        } = event.payload.data.output.result;
        if (action === "accept") {
            let notifications = [];
            if (ciCount > 0) {
                const successAlertId = 'autoattestation-success' + new Date().valueOf();
                notifications = [{
                    ...SUCCESS_NOTIFICATION_PROPS,
                    id: successAlertId,
                    header: await helpers.translate("Auto-attestation successful"),
                    content: await helpers.translate("{0} CIs auto-attested.", ciCount)
                }];
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: notifications
                });

                helpers.timing.setTimeout(() => api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
                    items: [{
                        id: successAlertId
                    }]
                }), 5000);
            }

            if (error && error.message) {
                const errorAlertId = 'autoattestation-error' + new Date().valueOf();
                notifications = [{
                    ...ERROR_NOTIFICATION_PROPS,
                    id: errorAlertId,
                    content: error.message
                }];

                helpers.timing.setTimeout(() => api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
                    items: [{
                        id: errorAlertId
                    }]
                }), 5000);
            }
        }
    }
}
