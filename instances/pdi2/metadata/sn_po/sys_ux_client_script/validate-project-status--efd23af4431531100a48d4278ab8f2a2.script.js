/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const response = api.data.promin_project_get_auto_retired_message.output.data.snPo.GlidePromin.prominGetRetiredMessage;
    if (response.message) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'previous-model-info-msg',
                status: 'warning',
                icon: 'info-circle-outline',
                content: await helpers.translate(response.message),
                action: {
                    type: 'dismiss'
                }
            }]
        });
    }
}
