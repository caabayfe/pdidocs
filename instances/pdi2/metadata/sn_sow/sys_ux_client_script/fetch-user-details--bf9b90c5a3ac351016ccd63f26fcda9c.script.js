/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    let convertedUserObject = api.context.props.userDetailsPopover;
    if (event.payload.name == 'closePopover' || !convertedUserObject) {
        api.setState("userDetails", null);
        return;
    }
    let isTeamsEnabled = imports['sn_sow.Enable MS Teams on Contact Popover']();
    api.setState("contextProps", {
        "userSysID": convertedUserObject.user_sys_id,
        "subTitle": convertedUserObject.subTitle,
        "actionLabelsArray": convertedUserObject.actionLabelsArray,
        "isTeamsEnabled": isTeamsEnabled,
        "modalID": convertedUserObject.modalID,
        "actionObj": convertedUserObject.actionObj
    });
}
