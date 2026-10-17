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
    const payload = event.payload;
    const taskType = api.context.props.taskType;
    const communicationPlanId = api.context.props.communicationPlanId;
    const communicationDetailsTaskFilterUtil = imports['sn_uib_tcm.CommunicationDetailsTaskFilterUtil']();
    const communicationDetailsTaskFilterUtilConstants = communicationDetailsTaskFilterUtil.CONSTANTS;
    const playBookCommunicationCardUtil = imports['sn_uib_tcm.PlayBookCommunicationCardUtil']();
    const playBookCardConstants = playBookCommunicationCardUtil.CONSTANTS;
    let activeTasks = api.state.activeTasks;

    const refreshController = () => {
        let filters = {};
        if (taskType) {
            if (taskType.toUpperCase() === communicationDetailsTaskFilterUtilConstants.FILTERS.PLAN_FILTERS.ADHOCTASKS) {
                filters.planFilters = [];
                filters.planFilters.push(communicationDetailsTaskFilterUtilConstants.FILTERS.PLAN_FILTERS.ADHOCTASKS);
                filters.dataFilters = [];
                filters.dataFilters.push(communicationDetailsTaskFilterUtilConstants.FILTERS.DATA_FILETRS.DIRECTCHAT);
                filters.dataFilters.push(communicationDetailsTaskFilterUtilConstants.FILTERS.DATA_FILETRS.DIRECTCALL);
            } else {
                filters.planFilters = [];
                if (taskType.toUpperCase() === communicationDetailsTaskFilterUtilConstants.FILTERS.PLAN_FILTERS.COMMUNICATIONTASKS) {
                    filters.planFilters.push(taskType);
                } else if (taskType.toUpperCase() === communicationDetailsTaskFilterUtilConstants.FILTERS.PLAN_FILTERS.COLLABORATIONTASKS) {
                    filters.planFilters.push(taskType);
                }
            }
        }

        if (communicationPlanId) {
            filters.communicationPlanIds = [];
            filters.communicationPlanIds.push(communicationPlanId);
        }
        api.emit("GET_TCM_CONTROLLER_DATA", {
            filters
        });

    };
    const removeCompletedRecordFromActiveTasks = (data) => {
        let sysId = data.sys_id;
        let indexToRemove = activeTasks.findIndex(task => task.sysId === sysId);
        if (indexToRemove !== -1) {
            if (activeTasks.length == 1 && indexToRemove == 0)
                activeTasks = [];
            else
                activeTasks.splice(indexToRemove, 1);
            api.setState("activeTasks", [...activeTasks]);
        }

    };

    // Sidebar discussion
    if (event.payload && event.payload.data && event.payload.data.table_name == "sys_cs_collab_member") {
        if ((event.payload.data.operation == "insert" && event.payload.data.action == 'entry' && event.payload.data.record.member_type.value == 'creator') ||
            (event.payload.data.operation == "update" && event.payload.data.changes[0] == 'active'))
            refreshController();
        return;
    }
    // MS Teams
    if (event.payload && event.payload.data && event.payload.data.table_name == "sn_tcm_collab_hook_ms_teams_chat") {
        if ((event.payload.data.operation == "insert" && event.payload.data.action == 'entry') || (event.payload.data.operation == "update" && event.payload.data.action == 'change'))
            refreshController();
        return;
    }

    // Notify Calls
    if (event.payload && event.payload.data && event.payload.data.table_name == "notify_conference_call") {
        if ((event.payload.data.operation == "insert" && event.payload.data.action == 'entry') || (event.payload.data.operation == "update" && event.payload.data.action == 'change' &&
                event.payload.data.record.state.value != 'complete'))
            refreshController();
        if (event.payload.data.operation == "update" && event.payload.data.action == 'change' && event.payload.data.record.state.value == 'complete')
            removeCompletedRecordFromActiveTasks(event.payload.data);
        return;
    }
    if (!payload || !payload.raw || !payload.raw.data) return;
    const rawData = payload.raw.data;
    if ((payload.type === playBookCardConstants.INCIDENT_COMM_TASK_TABLE || payload.type == playBookCardConstants.COMM_PLAN_TABLE || payload.type == playBookCardConstants.CHANNEL_TABLE ||
            payload.type == playBookCardConstants.COMM_TASK_TABLE) &&
        ((rawData.action === 'entry' && rawData.operation === 'insert') || (rawData.action === 'exit' && rawData.operation === 'delete') ||
            (rawData.action === 'change' && rawData.operation === 'update')) &&
        (rawData.changes.includes('state') || rawData.changes.includes('due_date') || rawData.changes.includes('communication_frequency') ||
            rawData.changes.includes('closed_at') || rawData.changes.includes('active') || rawData.changes.includes('last_communication') || rawData.changes.includes('comm_count') ||
            rawData.changes.includes('short_description') || rawData.changes.includes('comm_channel_config') || rawData.changes.includes('comm_task.comm_plan.source.sys_id') ||
            rawData.changes.includes('comm_plan.source.sys_id') || rawData.changes.includes('source.sys_id') || rawData.changes.includes('description')
        )
    ) {
        refreshController();
    }
}
