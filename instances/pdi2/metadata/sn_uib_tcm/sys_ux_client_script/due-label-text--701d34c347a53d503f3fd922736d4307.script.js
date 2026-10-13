/**
 * @param {params} params 
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var type = api.item.value.statusGroup;
    var commCount = api.item.value.comm_count.value;
    var frequency = api.item.value.communication_frequency.value;
    var dueLabel = "";
    if (type == "Overdue") dueLabel = commCount > 0 && frequency == 'recurring' ? helpers.translateSync("Next update late by") : helpers.translateSync("Past due");
    else if (type == "Upcoming") dueLabel = commCount > 0 && frequency == 'recurring' ? helpers.translateSync("Next update due in") : helpers.translateSync("Due in");
    return dueLabel;
}
