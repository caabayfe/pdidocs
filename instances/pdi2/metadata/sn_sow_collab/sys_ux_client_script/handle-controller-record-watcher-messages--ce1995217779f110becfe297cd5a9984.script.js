/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const payload = event.payload;
    if (!payload || !payload.raw || !payload.raw.data || !(["comm_task", "comm_plan", "comm_channel"].includes(payload.type))) return;

    const refreshTCMControllerData = function() {
        api.emit("TCM_CONTROLLER_GET_DATA", {
            filter: {
                planFilters: ["COLLABORATIONTASKS"]
            }
        });
    };

    const {action, operation, changes, sys_id, record} = payload.raw.data;
    const isInserted = action === "entry" && operation === "insert";
    const isDeleted = action === "exit" && operation === "delete";
    const isUpdated = action === "change" && operation === "update";

    switch (payload.type) {
        case 'comm_task':
            if (isInserted) {
                refreshTCMControllerData();
            } else if (isUpdated) {
                // If we have an update operation on any one of these fields then we need to refresh our source data.
                const fetchDependentFields = ["state", "due_date", "communication_frequency"];
                // It stores a mapping from record field to corresponding client slot data record [collaboration type : conference]
                const recordFieldToSlotDataMap = {
                    "short_description": "title"
                };

                if (fetchDependentFields.some(field => changes.includes(field))) {
                    refreshTCMControllerData();
                    return;
                }

                let isTaskUpdated = false;
                let updatedSlotData = api.state.upcomingSlotData.map(task => {
                    if (task.data.sysId === sys_id) {
                        // Create a deep copy of the slot data
                        task = JSON.parse(JSON.stringify(task));
                        changes.forEach(changedField => {
                            // If record field has no relevance to slot data then simply return.
                            if (!recordFieldToSlotDataMap[changedField]) return;
                            // Revise the updated field value in the related slot data object.
                            isTaskUpdated = true;
                            task.data[recordFieldToSlotDataMap[changedField]] = record[changedField].display_value;
                        });
                    }
                    return task;
                });
                if (isTaskUpdated) api.setState('upcomingSlotData', updatedSlotData);

                isTaskUpdated = false;
                let updatedPendingTasks = api.state.pendingCommTasks.map(task => {
                    if (task.sys_id.value === sys_id) {
                        // Create a deep copy of the pending task data
                        task = JSON.parse(JSON.stringify(task));
                        // Revise the updated field value in the related pending task object.
                        isTaskUpdated = true;
                        changes.forEach(changedField => task[changedField] = record[changedField]);
                    }
                    return task;
                });
                if (isTaskUpdated) api.setState('pendingCommTasks', updatedPendingTasks);
            } else if (isDeleted) {
                api.setState('upcomingSlotData', api.state.upcomingSlotData.filter(task => task.data.sysId !== sys_id));
                api.setState('pendingCommTasks', api.state.pendingCommTasks.filter(task => task.sys_id.value !== sys_id));
            }
            break;
        case 'comm_plan':
            if (isUpdated) {
                if (changes.includes('short_description')) {
                    let isTaskUpdated = false;
                    let updatedPendingTasks = api.state.pendingCommTasks.map(task => {
                        if (task.commPlanSysId === sys_id) {
                            // Create a deep copy of the pending task data
                            task = JSON.parse(JSON.stringify(task));
                            // Revise the updated field value in the related pending task object.
                            isTaskUpdated = true;
                            task.commPlanName = record.short_description.value;
                            task.commPlanDisplayName = record.short_description.display_value;
                        }
                        return task;
                    });
                    if (isTaskUpdated) api.setState('pendingCommTasks', updatedPendingTasks);
                }
            } else if (isDeleted) {
                api.setState('upcomingSlotData', api.state.upcomingSlotData.filter(task => task.data.commPlanSysId !== sys_id));
                api.setState('pendingCommTasks', api.state.pendingCommTasks.filter(task => task.commPlanSysId !== sys_id));
            }
            break;
        case 'comm_channel':
            if (isInserted) {
                refreshTCMControllerData();
            } else if (isDeleted) {
                api.setState('upcomingSlotData', api.state.upcomingSlotData.filter(task => task.data.commChannelSysId !== sys_id));
                api.setState('pendingCommTasks', api.state.pendingCommTasks.filter(task => task.channels[0].sys_id.value !== sys_id));
            }
            break;
    }
}
