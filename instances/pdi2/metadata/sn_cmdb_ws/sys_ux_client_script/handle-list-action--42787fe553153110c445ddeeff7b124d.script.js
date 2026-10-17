/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const EVENTS = {
        RELOAD_REVIEW_RECORDS: 'RELOAD_REVIEW_RECORDS',
        SET_LOADING_STATE: 'NOW_UXF_PAGE#SET_LOADING_STATE'
    };
    const TASK_UTIL = "sn_cmdb_ws.CMDBWsDMTaskUtil";
    const {
        LIFECYCLE_TASK_ACTION
    } = imports[TASK_UTIL]();
    const { parseErrorFromEvent, dispatchAndLogError } = imports["sn_cmdb_ws.CMDBWsDMErrorUtil"]();
    
    var actionName = '';
    var eventName = event.name;
    var selectedIds = event.payload.sysIds;
    if (api.state.listAction == LIFECYCLE_TASK_ACTION.DM_EXCLUDE_RECORDS) {
        actionName = LIFECYCLE_TASK_ACTION.DM_EXCLUDE_RECORDS;
        selectedIds = api.state.selectedRecords;
    }

    if (!actionName) {
        return;
    }
    api.emit(EVENTS.SET_LOADING_STATE, {
        "loading": true,
    });
    helpers.snHttp('/api/sn_cmdb_ws/cmdb_workspace_api_scoped/lifecycle_task/action',
        {
            method: 'POST',
            batch: false,
            body: {
                sysIds: selectedIds,
                taskToCiTable: api.state.listTable,
                userComment: api.state.inputComment,
                action: actionName,
                taskSysId: api.context.props.sysId,
                excludedSysIds: api.state.rowSelection.excludedSysIds,
                allRecordsSelected: api.state.rowSelection.allRecordsSelected
            }
        }
    ).then(async function({ response }) {
        api.emit(EVENTS.SET_LOADING_STATE, {
            "loading": null
        });

        api.setState("listRefresh", {timestamp: new Date()});

        // Start notification
        if (response.result) {
            const {
                handleLifecycleTaskNotification
            } = imports[TASK_UTIL]();

            handleLifecycleTaskNotification(response, api, event, helpers);
        }
        // End notification
    }).catch(async function(error) {
        api.emit(EVENTS.SET_LOADING_STATE, {
            "loading": null
        });

        const errorStr = await parseErrorFromEvent({ event, helpers });
        dispatchAndLogError(errorStr, { api, helpers });
    });
}
