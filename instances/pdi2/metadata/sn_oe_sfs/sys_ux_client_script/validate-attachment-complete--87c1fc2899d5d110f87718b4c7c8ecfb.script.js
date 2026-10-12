/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.payload.data.output.result === false) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [
                {
                    type: 'error',
                    message: event.payload.data.output.error
                }
            ]
        });
    } else {
        api.data.gformfont.save();
    }
}
