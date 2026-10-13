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
    const {
        output
    } = event.payload.data;

    if (output && output.success) {
        helpers.modal.close('confirm_delete_modal');
        const {
            startDate,
            endDate
        } = api.context.props;
        helpers.navigate.to('funnels', {}, {
            timestamp: Date.now(),
            startDate,
            endDate
        });
    } else {
        console.log('Error while deleting the funnel', output);
        let errorMsg = await helpers.translate('Error while deleting the funnel');
        if (output.status === 'INSUFFICIENT_PERMISSIONS') {
            errorMsg = output.message;
        }
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'delete-fail',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                content: errorMsg,
                action: {
                    type: 'dismiss'
                }
            }]
        });
        helpers.modal.close('confirm_delete_modal');
    }
}
