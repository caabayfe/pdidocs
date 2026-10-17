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
    const playBookCommunicationCardUtil = imports['sn_uib_tcm.PlayBookCommunicationCardUtil']();
    const _openModal = (routeValue) => {
        api.emit("MACROPONENT_VIEWPORT_LOAD_REQUESTED", {
            viewportElementId: 'modalContainerViewport',
            route: routeValue,
            fields: {
                type: "communicationTask",
                table: "comm_plan",
                sysId: api.state.commTaskDetails.commPlanId
            },
            params: {
                origin: "playbook"
            }
        });
    };
    switch (event.payload.item.id) {
        case 'close':
            api.setState("overFlowEvent", "close");
            helpers.modal.open('close_task_confirmation_modal');
            break;
        case 'snooze':
            api.setState("overFlowEvent", "snooze");
            helpers.modal.open('close_task_confirmation_modal');
            break;
        case 'start':
            api.setState("action", "start");
            break;
        case 'manageRecipients':
            _openModal('ref-manage-recipients-modal');
            break;
        case 'viewRecord':
            api.emit('NAV_ITEM_SELECTED', {
                "route": "record",
                "targetRoute": "current",
                "fields": {
                    "table": playBookCommunicationCardUtil.CONSTANTS.INCIDENT_COMM_TASK_TABLE,
                    "sysId": api.state.commTaskDetails.task_sys_id
                }
            });
            break;
    }
}
