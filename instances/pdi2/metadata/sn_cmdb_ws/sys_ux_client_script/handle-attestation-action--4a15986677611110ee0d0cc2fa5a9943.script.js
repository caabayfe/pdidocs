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
        ATTEST: 'REVIEW_CI#ATTEST',
        UNATTEST: 'REVIEW_CI#UNATTEST'
    };
    const ATTESTATION_UTIL = "sn_cmdb_ws.cmdbWSAttestationUtil";
    const USER_ROLE_UTIL = "sn_cmdb_ws.userRoleUtils";
    const {
        ATTESTATION_ACTION,
        UI_DEFAULT_LIMIT
    } = imports[ATTESTATION_UTIL]();

    var actionName = '';
    var eventName = event.name;
    var selectedIds = event.payload.sysIds;
    if (eventName == EVENTS.ATTEST) {
        actionName = ATTESTATION_ACTION.ATTEST;
    } else if (eventName == EVENTS.UNATTEST) {
        actionName = ATTESTATION_ACTION.UNATTEST;
    } else if (api.state.attestationAction == ATTESTATION_ACTION.REJECT) {
        actionName = ATTESTATION_ACTION.REJECT;
        selectedIds = api.state.selectedCis;
    } else if (api.state.attestationAction == ATTESTATION_ACTION.DUPLICATE) {
        actionName = ATTESTATION_ACTION.DUPLICATE;
        selectedIds = api.state.selectedCis;
    } else if (api.state.attestationAction == ATTESTATION_ACTION.EXCLUDE) {
        actionName = ATTESTATION_ACTION.EXCLUDE;
        selectedIds = api.state.selectedCis;
    }
    if (!actionName) {
        return;
    }

    if (api.state.rowSelection.selectionCount <= UI_DEFAULT_LIMIT.ATTEST_RECORDS) {
        api.emit(EVENTS.SET_LOADING_STATE, {
            "loading": true,
        });
    }
    helpers.snHttp('/api/sn_cmdb_ws/cmdb_workspace_api_scoped/attestation/action',
        {
            method: 'POST',
            batch: false,
            body: {
                sysIds: selectedIds,
                userComment: api.state.attestComment,
                action: actionName,
                taskSysId: api.context.props.sysId,
                currentAttestationStatus: api.state.rowSelection.currentAttestationStatus,
                excludedSysIds: api.state.rowSelection.exceptedRecords,
                allRecordsSelected: api.state.rowSelection.allRecordsSelected,
                selectionCount: api.state.rowSelection.selectionCount,
                query: api.state.rowSelection.query 
            }
        }
    ).then(async function({ response }) {
        const {
            progressId
        } = response.result;
        if (progressId) {
            api.setState('progressId', progressId);
            return;
        }
        api.emit(EVENTS.SET_LOADING_STATE, {
            "loading": null
        });

        api.emit(EVENTS.RELOAD_DATA, {});

        // Start notification
        if (response.result) {
            const {
                handleAttestationNotification
            } = imports[ATTESTATION_UTIL]();

            const { hasCmdbEditor, hasAdminOrMaint } = imports[USER_ROLE_UTIL]();

            handleAttestationNotification(response, hasCmdbEditor, hasAdminOrMaint, api, event, helpers);
        }
        // End notification
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
}
