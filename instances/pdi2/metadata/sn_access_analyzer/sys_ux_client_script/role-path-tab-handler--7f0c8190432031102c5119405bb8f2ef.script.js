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

    var props = api.state.props;
    if (event.payload.isInitialPageLoad || props.hasServerError) return;

    const aaUtil = imports["sn_access_analyzer.AccessanalyzerUIUtil"](api, helpers);


    let userType = event.payload.selectedTabIndex === 0 ? "baseUser" : "modelUser";
    const currentUser = api.state[userType];
    aaUtil.log('Tab change handler - ', currentUser.name, ' - ', currentUser.type, ', Status : ',
        currentUser.status, ", Role Status", currentUser.roleStatus);
    props.selectedTabIndex = event.payload.selectedTabIndex;

    /**
     * in currentUser the active tab user infor will be available
     * The user status will be updated once debug_log table loaded
     */
    if (currentUser.status === 'rendered' || currentUser.status === 'dataRequested') {
        return;
    } else if (currentUser.roleStatus === "blocked" || !props.hasACLs) {
        updateMapForBlockedUser(currentUser);
        return;
    }

    /**
     * if user role status is passed
     */
    fetchNodeMapData(currentUser);

    function fetchNodeMapData(user) {
        aaUtil.log("raiseNodeMapRequest", user.type);
        user.status = 'dataRequested';
        api.setState(user.type, {...user});
        let roleList = api.data.sysSecurityAclRole.results.map(role => role.sys_user_role.value);
        api.setState("ucDataBrokerPayload", {
            method: 'getRoleMap',
            userId: user.id,
            userType: user.type,
            targetRoles: roleList
        });
    }

    function updateMapForBlockedUser(user) {
        aaUtil.log("updateMapForBlockedUser", user.type);
        const {updateMap} = imports["sn_access_analyzer.UserRoleMapUtil"](api, helpers);
        const insightsUtil = imports["sn_access_analyzer.AccessInsightsUtil"](api, helpers);
        updateMap(user);
        user.status = 'rendered';
        // user.type will be either baseUser or modelUser
        api.setState(user.type, {...user});
        let u = event.payload.selectedTabIndex === 0 ? api.state.modelUser : api.state.baseUser;
        insightsUtil.showNoData(user.type + "Widget", u.name);
    }
}
