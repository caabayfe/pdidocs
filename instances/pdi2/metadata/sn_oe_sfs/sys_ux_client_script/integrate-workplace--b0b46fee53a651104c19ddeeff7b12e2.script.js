/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.snHttp(`api/sn_oe_sfs/bot_install/workplace/va`, {method: 'GET'})
        .then(({response}) => {
            api.emit("NAV_ITEM_SELECTED", {
                external: {
                    url: response.result
                }
            });      
        })
        .catch(({error}) => {
            const message = `Error: ${error.data.error.message}`;
            console.error(message);
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            id: 'alert5',
            status: 'high',
            icon: 'info-circle-outline',
            content: message,
            action: { type: 'dismiss' }
        });
    });
}
