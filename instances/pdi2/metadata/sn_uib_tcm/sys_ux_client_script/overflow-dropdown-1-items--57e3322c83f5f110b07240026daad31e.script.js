/**
 * @param {params} params 
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var state = api.item.value.state.value;
    var commCount = api.item.value.comm_count.value;
    var frequency = api.item.value.communication_frequency.value;
    var canClose = api.item.value.canClose;
    var canStart = api.item.value.canStart;
    var canSnooze = api.item.value.canSnooze;
    var permissions = api.item.value.permissions;
    var isRecordInactive = (api.data.record.form.fields && api.data.record.form.fields.active && api.data.record.form.fields.active.value == "false");
    var listItems = [];
    if (canStart) listItems.push({
        "id": "start",
        "label": helpers.translateSync("Start task")
    });
    if (canSnooze && state != "3" && state != "7") listItems.push({
        "id": "snooze",
        "label": helpers.translateSync("Snooze")
    });
    if (permissions.manage_recipients && !canStart && !isRecordInactive) listItems.push({
        "id": "manage_recipients",
        "label": helpers.translateSync("Manage recipients")
    });
    listItems.push({
        "id": "view_record",
        "label": helpers.translateSync("View record")
    });
    if (state != "3" && state != "7" && canClose) listItems.push({
        "id": "close",
        "label": helpers.translateSync("Close")
    });
    return listItems;
}
