/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    
    const EVENTS = {
        RELOAD_DATA: 'RELOAD_DATA',
        SET_LOADING_STATE: 'NOW_UXF_PAGE#SET_LOADING_STATE',
        ADD_NOTIFICATIONS: 'NOW_UXF_PAGE#ADD_NOTIFICATIONS',
        REMOVE_NOTIFICATIONS: 'NOW_UXF_PAGE#REMOVE_NOTIFICATIONS'
    };
    const ATTESTATION_UTIL = "sn_cmdb_ws.cmdbWSAttestationUtil";

    api.emit(EVENTS.SET_LOADING_STATE, {
        "loading": true,
    });

    helpers.snHttp('/api/sn_cmdb_ws/cmdb_workspace_api_scoped/smartdetection/action',
        {
            method: 'POST',
            batch: false,
            body: {
                action: 'accept',
                taskId: api.context.props.sysId,
                ciCount: api.state.smartDetectionCount,
                hidePopupUserPref: true
            }
        }
    ).then(async function({ response }) {
        api.emit(EVENTS.SET_LOADING_STATE, {
            "loading": null
        });

        api.emit(EVENTS.RELOAD_DATA, {});

        // Handle attest all success
        const {
            SUCCESS_NOTIFICATION_PROPS,
            ERROR_NOTIFICATION_PROPS
        } = imports[ATTESTATION_UTIL]();

        api.data.get_smart_detection_state.refresh();
        if (response.result) {
            const {
                action,
                ciCount,
                error
            } = response.result;
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
                    api.emit(EVENTS.ADD_NOTIFICATIONS, {
                        items: notifications
                    });

                    helpers.timing.setTimeout(() => api.emit(EVENTS.REMOVE_NOTIFICATIONS, {
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

                    helpers.timing.setTimeout(() => api.emit(EVENTS.REMOVE_NOTIFICATIONS, {
                        items: [{
                            id: errorAlertId
                        }]
                    }), 5000);
                }
            }
        }
        // End attest all success

        // Set progress donut
        const {
            setDonutProgress
        } = imports[ATTESTATION_UTIL]();
        setDonutProgress(api, event, helpers);
        // End progress donut
    }).catch(function(error) {
        api.emit(EVENTS.SET_LOADING_STATE, {
            "loading": null
        });
    });

    api.setState('renderSmartDetectionScreen', false);
}
