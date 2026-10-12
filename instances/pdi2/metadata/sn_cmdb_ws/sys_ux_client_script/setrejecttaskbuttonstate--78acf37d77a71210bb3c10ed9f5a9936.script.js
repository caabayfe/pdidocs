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
    const {
        DM_POLICY_TYPE_IDS,
        DM_TASK_STATE
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    const rejectTaskButtonState = {
        hide: true,
        disable: true
    };

    if (api.data.get_task_info.result) {

        const taskInfoResult = api.data.get_task_info.result;

        const policyType = taskInfoResult.policy_id._reference.cmdb_policy_type.value;
        const state = taskInfoResult.state.value;
        const assignedTo = taskInfoResult.assigned_to.value;

        const isTaskOpen = state === DM_TASK_STATE.OPEN;

        const isLifeCycleTask = (policyType === DM_POLICY_TYPE_IDS.LIFECYCLE.RETIRE ||
            policyType === DM_POLICY_TYPE_IDS.LIFECYCLE.ARCHIVE || policyType === DM_POLICY_TYPE_IDS.LIFECYCLE.DELETE);

        if (isLifeCycleTask) {
            rejectTaskButtonState.hide = false;
        }
        if (isTaskOpen) {
            rejectTaskButtonState.disable = false;
        }
    }
    api.setState("rejectTaskButtonState", rejectTaskButtonState);
}
