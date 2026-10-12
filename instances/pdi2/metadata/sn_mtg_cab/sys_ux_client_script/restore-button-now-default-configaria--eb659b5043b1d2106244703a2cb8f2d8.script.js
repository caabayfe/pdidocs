/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.context.props.agendaItemRecordData?.task?.record)
        return;

    const taskNumber = api.context.props.agendaItemRecordData.task.record.number.display_value;
    return {
        "aria-label": helpers.translateSync("Restore - {0}", taskNumber)
    };
}
