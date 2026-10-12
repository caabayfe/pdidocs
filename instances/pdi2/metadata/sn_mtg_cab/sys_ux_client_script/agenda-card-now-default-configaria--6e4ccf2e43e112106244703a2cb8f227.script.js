/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({api, helpers}) {
    if (!api.context.props.agendaItemRecordData || !api.context.props.agendaItemRecordData.task || !api.context.props.agendaItemRecordData.task.record)
        return {
            button: {
                'aria-label': helpers.translateSync('You are not allowed to view this Agenda Item')
            }
        };

    const number = api.context.props.agendaItemRecordData.task.record.number.display_value;
    const shortDescription = api.context.props.agendaItemRecordData.task.record.short_description.display_value;
    return {
        button: {
            'aria-label': helpers.translateSync('Number: {0}, Short description: {1}', [number, shortDescription])
        }
    };
}
