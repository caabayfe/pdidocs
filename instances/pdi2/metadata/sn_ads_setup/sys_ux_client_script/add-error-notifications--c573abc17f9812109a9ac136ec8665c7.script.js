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
    const result = api.data.get_setup_detail_1.result;
    
    const emitNotification = async (content) => {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'alert-1',
                status: 'critical',
                icon: 'exclamation-triangle-fill',
                content: await helpers.translate(content),
                action: {
                    type: 'dismiss'
                }
            }]
        });
    };

    if (!result || !result['name']) {
        await emitNotification('Record not found, please try again!');
    } else if (result['setup_execution_type'].value !== "multiple") {
        await emitNotification('This page is not supported for single run Guided Setup!');
    }
}
