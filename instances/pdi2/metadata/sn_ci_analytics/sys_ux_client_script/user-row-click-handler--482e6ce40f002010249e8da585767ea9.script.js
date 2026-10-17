/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const rowData = event.payload.row.rowData.value;
    const {startDate, endDate} = api.context.props;
    const userIndex = parseInt(rowData.get('user_index').columnData.value || -1);
    const userId = event.payload.sys_id;
    if (userId) {
        helpers.navigate.to('user-details', {
            userId: userId,
            userIndex: userIndex
        }, {
            startDate: startDate,
            endDate: endDate,
            aceNav: 'users'
        });
    }
}
