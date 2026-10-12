/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    let message = await helpers.translate('Something went wrong');
    try {
        message = await helpers.translate(event.payload.data.output.data.snPo.GlidePromin.prominValidateEntityTemplate.message);
    } catch (err) {}
    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            id: 'validate-template-entity-error',
            status: 'critical',
            icon: 'exclamation-triangle-outline',
            content: message,
            action: {
                type: 'dismiss'
            },
        }],
    });
}
