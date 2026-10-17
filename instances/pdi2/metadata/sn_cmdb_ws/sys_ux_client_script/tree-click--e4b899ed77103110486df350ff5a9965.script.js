/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let sysId = event.payload.item.id;
    let type = event.payload.item.type;
    let viewMode = "library";
    if (type == "template") {
        viewMode = "template";
        api.setState('templateSysId', sysId);
    } else {
        api.setState('librarySysId', sysId);
    }
    api.setState('viewMode', viewMode);
    //clear any previous notifications 
    api.emit('NOW_UXF_PAGE#CLEAR_NOTIFICATIONS', {});
}
