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
    const result = api.data.get_user_contact_details.output;
    if (!result) return;
    if (!result.name) {
        api.setState("userDetails", {
            "userName": api.context.props.userDetailsPopover.userName
        });
        return;
    }
    const preferredContactSource = imports['sn_sow.ContactPreferred']();
    let backupContactSource = (preferredContactSource == "mobile_phone") ? "phone" : "mobile_phone";
    let userPhone = result[preferredContactSource] || result[backupContactSource];
    let avatar = result.avatar ? result.avatar + ".iix" + "?t=small" : "";
    let name = (result.active == "1") ? result.name : result.name + await helpers.translate(" (Archived)");
    api.setState("userDetails", {
        "userName": name,
        "email": result.email,
        "phone": userPhone,
        "avatar": avatar,
        "active": result.active,
        "emailDeepLink": "mailto:" + result.email,
        "teamsDeepLink": "https://teams.microsoft.com/l/chat/0/0?users=" + result.email
    });
}
