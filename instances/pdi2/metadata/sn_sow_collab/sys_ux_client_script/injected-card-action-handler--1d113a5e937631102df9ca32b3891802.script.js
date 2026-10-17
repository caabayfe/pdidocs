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
    async function executeStateAction(actionData) {
        api.setState("injectedCardActionClicked", { ...actionData });
        helpers.modal.open("confirm_and_do_action", {
            headerLabel: await buildContent(actionData.action, 'confirm')
        });
    }

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

    async function buildNotificationMessage(action, result) {
        if (!action) return;
        const notificationMessage = {
            id: "wb-state-action",
            action: {
                type: "dismiss"
            },
            icon: "info-circle-outline"
        };
        if (result) {
            notificationMessage.status = "positive";
            notificationMessage.content = await buildContent(action, "positive");

            if (action == "snooze") {
                api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
                    event: 'Task Snoozed',
                    value: {
                        type: "Collaboration Task",
                        context: "Record"
                    }
                });
            }
        } else {
            notificationMessage.status = "critical";
            notificationMessage.content = await buildContent(action, "critical");
        }
        return notificationMessage;
    }
    switch (event.name) {
        case "NOTIFY_HANDLE_DROPDOWN_SELECT":
            if (!event.payload) return;
            const actionData = event.payload.data;
            switch (event.payload.id) {
                case "manage_participants":
                    api.emit("MACROPONENT_VIEWPORT_LOAD_REQUESTED", {
                        viewportElementId: "modal_viewport",
                        route: "manage-recipients-modal",
                        fields: actionData,
                        params: {
                            origin: "record"
                        }
                    });
                    break;
                case "view_record":
                    api.emit("NAV_ITEM_SELECTED", {
                        route: "record",
                        fields: actionData,
                        params: null,
                        redirect: false,
                        passiveNavigation: null,
                        title: null,
                        multiInstField: null,
                        targetRoute: "current",
                        external: null
                    });
                    break;
                case "snooze":
                case "close":
                case "start":
                    executeStateAction(actionData);
                    break;
            }
            break;
        case "NOW_CONFIRM_DESTROY_MODAL#CONFIRM_CLICKED":
            const injectedCardActionClickedDetails = { ...api.state.injectedCardActionClicked };
            if (!injectedCardActionClickedDetails) return;
            injectedCardActionClickedDetails.timestamp = new Date().valueOf();
            api.setState("injectedCardActionClickedDetails", injectedCardActionClickedDetails);
            break;
        case "DATA_FETCH_SUCCEEDED":
            if (event.elementId === "update_comm_task_state") {
                const output = api.data.update_comm_task_state.output;
                if (!output) return;
                if (!api.state.injectedCardActionClickedDetails) return;
                const action = api.state.injectedCardActionClickedDetails.action;
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [await buildNotificationMessage(action, output.result)]
                });
            }
            break;
    }
}
