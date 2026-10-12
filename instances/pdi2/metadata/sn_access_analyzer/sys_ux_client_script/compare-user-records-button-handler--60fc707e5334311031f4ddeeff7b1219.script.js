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
    const baseUserId = api.state.compareUsersTab.urcBaseUser.selectedId;
    const modelUserId = api.state.compareUsersTab.urcModelUser.selectedId;
    if (!baseUserId || !modelUserId) {
        const compareUsersTabClone = { ...api.state.compareUsersTab };
        compareUsersTabClone["showMandatoryError"] = true;
        api.setState("compareUsersTab", compareUsersTabClone);
        return;
    }

    helpers.navigate.to("user-profile-comparison", {
            "baseUserId": baseUserId,
            "modelUserId": modelUserId
        });
}
