/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        parseErrorFromEvent
    } = imports["sn_cmdb_ws.CMDBWsErrorUtil"]();
    const error = await parseErrorFromEvent({ event, helpers });
    api.emit('EXPLORE_CI_SHOW_NOTIFICATIONS', {
        items: [{
            "id": "tags_update_error",
            "status": "critical",
            "icon": "info-circle-outline",
            "content": error.MSG,
            "action": { "type": "dismiss" }
        }]
    });
    helpers.modal.close("manage_tags_modal");
    api.setState("manageTags", []);
    api.setState("tagsRefresh", {"timestamp" : Date.now()});
}
