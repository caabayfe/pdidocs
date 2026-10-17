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
        ERROR_NOTIFICATION_PROPS
    } = imports["sn_cmdb_ws.cmdbWSAttestationUtil"]();
    api.setState('renderSmartDetectionScreen', false);
    api.data.perform_smart_detection_action.execute({
        action: 'cancel',
        taskId: api.context.props.sysId,
        ciCount: api.state.smartDetectionCount,
        hidePopupUserPref: !!api.state.hidePopupUserPref
    });
    const alertId = 'autoattestation-cancelled' + new Date().valueOf();
    const notifications = [{
        ...ERROR_NOTIFICATION_PROPS,
        id: alertId,
        header: await helpers.translate("Auto-attestation cancelled."),
        content: await helpers.translate("CIs can be manually attested.")
    }];
    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
        items: notifications
    });

    helpers.timing.setTimeout(() => api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
        items: [{
            id: alertId
        }]
    }), 5000);
}
