/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.data.save_user_preference.execute({
        "name": "sow.incident.landing_page_header_collapsed",
        "value": true
    });
    api.emit('HIDE_HEADER', {});
}
