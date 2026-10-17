/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const agendaRecord = api.context.props.agendaItemRecordData;
    const taskNumber = agendaRecord.task.record.number.display_value;
    if (agendaRecord.state.value === "in_progress")
        return {
            "aria-label": helpers.translateSync("Pause - {0}", taskNumber)
        };
    else if (agendaRecord.state.value === "paused")
        return {
            "aria-label": helpers.translateSync("Resume - {0}", taskNumber)
        };
}
