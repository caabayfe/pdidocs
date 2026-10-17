/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const {startDate, endDate} = api.context.props;
    const rowData = event.payload.row.rowData.value;
    const topicName = rowData.get("topic").columnData.value;
    helpers.navigate.to("topic-details", null, {
        startDate: startDate,
        endDate: endDate,
        topicName: topicName
    });
}
