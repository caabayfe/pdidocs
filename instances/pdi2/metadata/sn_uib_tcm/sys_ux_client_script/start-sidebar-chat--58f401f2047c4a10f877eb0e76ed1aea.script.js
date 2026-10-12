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
	const DELAY_MODAL_CLOSURE_MILLISECONDS = 1000;
	const closeLoader = () => helpers.modal.close('loader_modal');
    api.emit('RECORD#OPEN_COLLAB_CHAT', {
        fields: {
            "parentTable": 'incident_alert_task',
            "parentSysId": api.state.collabTaskDetails.task_sys_id,
            "config": {
                'participants': api.data.resolve_icp_prefill_participants_for_sidebar_chat.output.users,
                'prefill': false,
                'isPermissionCheckNeeded': false
            }
        }
    });
    helpers.timing.setTimeout(closeLoader, DELAY_MODAL_CLOSURE_MILLISECONDS); 
}
