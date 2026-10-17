/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({api, event, helpers, imports}) {
    const CONFIRM_COMM_TASK_ACTION_MODAL_ID = 'confirm_comm_task_action';
    const UPDATE_COMM_TASK_STATE_DATA_RESOURCE_ID = 'update_chat_comm_task_state';
    const CONFIRM_MODAL_LABEL = await helpers.translate('Confirmation');

    const buildContent = async (action, type) => {
        switch (action) {
            case 'close':
                switch (type) {
                    case 'confirm': return await helpers.translate('Are you sure you want to close this task?');
                    case 'positive': return await helpers.translate('You have closed the task');
                    case 'critical': return await helpers.translate('Failed to close the task');
                }
                break;
            case 'start':
                switch (type) {
                    case 'confirm': return await helpers.translate('Are you sure you want to start this task?');
                    case 'positive': return await helpers.translate('You have started the task');
                    case 'critical': return await helpers.translate('Failed to start the task');
                }
                break;
            case 'snooze':
                switch (type) {
                    case 'confirm': return await helpers.translate('Are you sure you want to snooze this task?');
                    case 'positive': return await helpers.translate('You have snoozed the task');
                    case 'critical': return await helpers.translate('Failed to snooze the task');
                }
                break;
            default:
                return '';
        }
        return '';
    };

    const buildNotificationMessage = async (action, result) => {
        if (!action) return;
        const notificationMessage = {
            id: 'wb-state-action',
            action: {
                type: 'dismiss'
            },
            icon: 'info-circle-outline'
        };
        if (result) {
            notificationMessage.status = 'positive';
            notificationMessage.content = await buildContent(action, 'positive');
        } else {
            notificationMessage.status = 'critical';
            notificationMessage.content = await buildContent(action, 'critical');
        }
        return notificationMessage;
    };

    const openConfirmationModal = async (actionId, label) => {
        helpers.modal.open(CONFIRM_COMM_TASK_ACTION_MODAL_ID, {
            headerLabel: label,
            content: await buildContent(actionId, 'confirm')
        });
    };

    const openManageParticipantsModal = (optionId, commPlanSysId) => {
        api.emit('HANDLE_COMM_TASK_ACTION#DROPDOWN_SELECT', {
            id: optionId,
            data: {
                type: 'collaborationTask',
                table: 'incident_alert',
                sysId: commPlanSysId
            }
        });
    };

    const openRecord = (sysId, table) => {
        api.emit('NAV_ITEM_SELECTED', {
            route: 'record',
            fields: {
                table: table,
                sysId: sysId
            },
            params: null,
            redirect: false,
            passiveNavigation: null,
            title: null,
            multiInstField: null,
            targetRoute: 'current',
            external: null
        });
    };

    switch (event.name) {
        case 'NOW_DROPDOWN#ITEM_CLICKED':
            const option = event.payload.item;
            const commTask = event.context.item.value;
            switch (option.id) {
                case 'start':
                case 'close':
                case 'snooze':
                    api.setState('selectedAction', {
                        action: option.id,
                        commTaskId: commTask.sys_id
                    });
                    openConfirmationModal(option.id, CONFIRM_MODAL_LABEL);
                    break;
                case 'view_record':
                    openRecord(commTask.sys_id, commTask.table);
                    break;
                case 'manage_participants':
                    openManageParticipantsModal(option.id, commTask.comm_plan_sys_id);
                    break;
                default:
                    // no operation
                    break;
            }
            break;
        case 'NOW_CONFIRM_MODAL#POSITIVE_BUTTON_CLICKED':
            if (JSON.stringify(api.state.selectedAction) === JSON.stringify(api.state.confirmedAction))
                api.data[UPDATE_COMM_TASK_STATE_DATA_RESOURCE_ID].refresh(); // If the same action is repeated twice, then explicitly trigger the REST API call.
            else
                api.setState('confirmedAction', { ...api.state.selectedAction });
            break;
        case 'DATA_FETCH_SUCCEEDED':
            if (event.elementId === UPDATE_COMM_TASK_STATE_DATA_RESOURCE_ID) {
                const output = api.data.update_chat_comm_task_state.output;
                if (!output || !api.state.selectedAction) return;
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                    items: [await buildNotificationMessage(api.state.selectedAction.action, output.result)]
                });
            }
            break;
        default:
            // no operation
            break;
    }
}
