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
    api.emit('_LIST_CTRL#CLOSE_MODAL_RELAY_2fa00e9e5317b110dce5ddeeff7b1211');
    const alertStatus = 'info';
    const actionLabel = await helpers.translate('Dismiss');

    const deleteResult = event.payload.data.output.data.GlideCascadeDelete_Query.deleteResult;

    const numRecordsDeleted = deleteResult.numRecordsDeleted || 0;
    const numTotalRecords = deleteResult.numTotalRecords || 0;

    const isAllRecordsDeleted = numTotalRecords === numRecordsDeleted;
    const numRecordsNotDeleted = numTotalRecords - numRecordsDeleted;

    const alertContent = isAllRecordsDeleted ?
        helpers.translate('{0} record(s) have been successfully deleted.', numRecordsDeleted) :
        helpers.translate('Not able to delete {0} record(s).', numRecordsNotDeleted);

    const alertList = [{
        id: `cascade_delete_status`,
        status: alertStatus,
        content: await alertContent,
        action: {
            type: 'dismiss',
            label: actionLabel
        },
        icon: 'check-fill'
    }];

    api.emit('_LIST_CTRL#REFRESH_REQUESTED_RELAY_2fa00e9e5317b110dce5ddeeff7b1211');
    api.emit('_LIST_CTRL#ADD_NOTIFICATIONS_RELAY_2fa00e9e5317b110dce5ddeeff7b1211', {
        items: alertList
    });
}
