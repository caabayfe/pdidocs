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
    const output = api.data.update_comm_task_state.output.result;
    let notificationMessage = {};
    const item = api.state.action;
    api.setState("action", null);
    if (item === 'close') {
        if (output) {
            notificationMessage.message_type = "success";
            notificationMessage.message = await helpers.translate("You have closed the task");
        } else {
            notificationMessage.message_type = "failed";
            notificationMessage.message = await helpers.translate("Failed to close the task");
        }
    } else if (item === 'snooze') {
        if (output) {
            notificationMessage.message_type = "success";
            notificationMessage.message = await helpers.translate("You have snoozed the task");
            api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
                event: 'Task Snoozed',
                value: {
                    type: "Communication Task",
                    context: "Playbook"
                }
            });
        } else {
            notificationMessage.message_type = "failed";
            notificationMessage.message = await helpers.translate("Failed to snooze the task");
        }
    }
    if (item != 'start') {
        api.emit("DISPATCH_NOTIFICATION_MESSAGE", {
            notificationMessage
        });
    }

}
