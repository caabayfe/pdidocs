/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var message = await helpers.translate('<b>Thank you.</b> We have received your suggestion.');
    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            status: 'positive',
            icon: 'circle-info-outline',
            content: {
                type: 'html',
                value: `<span>${message}</span>`
            },
            action: {
                type: 'dismiss'
            }
        }]
    });
}
