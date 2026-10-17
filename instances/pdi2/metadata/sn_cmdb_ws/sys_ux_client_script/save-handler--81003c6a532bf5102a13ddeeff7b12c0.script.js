/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({ api, event, helpers, imports }) {
    let notifications = [];
    const { errorCount = 0, recordCount = 0 } = event.payload.result;
    const successfulRecordCount = recordCount - errorCount;
    if (successfulRecordCount > 0) {
        notifications.push({
            status: 'positive',
            content: await helpers.translate(
                '{0} record(s) updated successfully',
                successfulRecordCount
            ),
            action: { type: 'dismiss' },
        });
    }

    if (errorCount > 0) {
        notifications.push({
            status: 'critical',
            content: await helpers.translate(
                '{0} record(s) not updated',
                errorCount
            ),
            action: { type: 'dismiss' },
        });
    }
    api.emit('ADD_LIST_NOTIFICATIONS', {
        notifications,
    });
}
