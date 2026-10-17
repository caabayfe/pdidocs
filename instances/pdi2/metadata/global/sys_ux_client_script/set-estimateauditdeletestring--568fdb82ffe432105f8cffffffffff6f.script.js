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
    if (api.state.retentionChoice != api.state.currChoice && api.state.currChoice != "" && api.state.currChoice != "Forever") {
        api.setState("retentionChoice", api.state.currChoice);
        return;
    } else if (!api.state.retentionChoice && (api.state.currChoice == "" || api.state.currChoice == "Forever") && api.data.record_5.form.fields.audit_retention.value != "") {
        api.setState("retentionChoice", api.data.record_5.form.fields.audit_retention.value);
        return;
    }

    var titleString = "<b>Number of records affected</b>";
    var deletionCount = Number(api.data.record_estimate_1.output.count || 0);
    var deletionPercentage = api.data.record_estimate_1.output.percentage || 0;
    api.setState("totalRecordCount", api.data.record_estimate_1.output.totalRecordCount || 0);

    if (deletionCount > 0) {
        var formattedDeletionCount;
        const num = deletionCount;

        if (!num) {
            formattedDeletionCount = "0";
        } else {
            const trillion = 1000000000000;
            const billion = 1000000000;
            const million = 1000000;
            const thousand = 1000;

            if (num >= trillion) {
                formattedDeletionCount = (num / trillion).toFixed(2) + "T";
            } else if (num >= billion) {
                formattedDeletionCount = (num / billion).toFixed(2) + "B";
            } else if (num >= million) {
                formattedDeletionCount = (num / million).toFixed(2) + "M";
            } else if (num >= thousand) {
                formattedDeletionCount = (num / thousand).toFixed(2) + "K";
            } else {
                formattedDeletionCount = num.toString();
            }
        }

        var formatString = `${titleString}:<br>Approximately <b>${formattedDeletionCount} (${deletionPercentage}%)</b> audit records are older than the selected duration of ${api.state.retentionChoice} and will be permanently deleted.`;
        api.setState("estimatedAuditDeletionString", formatString);
    } else {
        api.setState("estimatedAuditDeletionString", `No audit records will be deleted for the selected ${api.state.retentionChoice} retention period.`);
    }
}
