/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.context.props.agendaItemRecordData)
        return;

    const agendaItemRecordData = api.context.props.agendaItemRecordData;
    const stack = [];
    const record = {};
    const taskRecordData = agendaItemRecordData.task?.record;
    const shortDesc = taskRecordData?.short_description?.display_value;

    if (!taskRecordData)
        // You are not allowed to view this Agenda Item or invalid Agenda Item
        return stack;

    record.label = helpers.translateSync('Record:');
    record.value = [{
            type: 'string',
            value: taskRecordData.number.display_value
        },
        {
            type: 'html',
            value: `<strong>${shortDesc}</strong>`
        }
    ];
    stack.push(record);
    return stack;
}
