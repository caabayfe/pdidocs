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
    let action = api.state.confirmedCommTaskToBeUpdated && api.state.confirmedCommTaskToBeUpdated.action;
    if (!action) return;
    let message, type, icon;
    if (event.name == "DATA_FETCH_SUCCEEDED") {
        message = action == "snooze" ? await helpers.translate("You have snoozed the task") : action == "close" ? await helpers.translate("You have closed the task") : "";
        type = "positive";
        api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
        event: 'Task Snoozed',
        value:  {
                   type: "Communication Task",
                   context: "Record"
                }
        });
    } else if (event.name == "DATA_FETCH_FAILED") {
        message = action == "snooze" ? await helpers.translate("Failed to snooze the task") : action == "close" ? await helpers.translate("Failed to close the task") : "";
        type = "critical";
    }
    if (message && type) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            "items": [{
                "id": "comm-task-msg",
                "action": {
                    "type": "dismiss"
                },
                "content": message,
                "status": type,
                "icon": type == "critical" ? "exclamation-triangle-outline" : "info-circle-outline",
            }]
        });
    }
}
