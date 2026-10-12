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

    const { setHeader, EvalStatus, getUserObject, EmptyState } = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);
    const pListCtrl = imports["sn_access_analyzer.PresentationListController"](api, helpers).getController("tableDef");
    const props = api.state.props;

    ({
        accessResult: accesResultAndDebugLog,
        debugLog: accesResultAndDebugLog,
        aaCommonDB: aaCommonDBSuccessHandler,
        sysSecurityACLRole: sysSecurityACLRole
    } [event.elementId])();

    // -------------------------------------------------------------------------------- //
    function accesResultAndDebugLog() {
        let reqInfo = setHeader({
            result: api.data.accessResult.results,
            debugLog: api.data.debugLog.results,
            screenIndex: 3
        });

        props.baseUserId = reqInfo.baseUser.id;
        props.modelUserId = reqInfo.modelUser.id;

        pListCtrl.updateHeader({
            name: api.state.translatedMessages.name,
            baseUser: reqInfo.baseUser.name,
            modelUser: reqInfo.modelUser.name
        });

        if (event.elementId != "debugLog") return;

        if (api.data.accessResult.results.length < 2) {
            pListCtrl.hideLoader();
            EmptyState.showNoDataMessage();
            return;
        };

        const aclResult = getUserObject(api.data.debugLog.results, row => row._row_data.uniqueValue == api.context.props.baseUserDebugLogId ? "baseUser" : "modelUser");
        const user = aclResult.baseUser || aclResult.modelUser;
        props.aclId = user.record_ref.value;

        props.baseUserRoleStatus = aclResult.baseUser != null ? aclResult.baseUser.roles_result.value : null;
        props.modelUserRoleStatus = aclResult.modelUser != null ? aclResult.modelUser.roles_result.value : null;

        var comparator = new imports["sn_access_analyzer.AccessComparator"](api, helpers).getComparator("acl", api.context.props.baseUserDebugLogId, api.context.props.modelUserDebugLogId);
        var result = comparator.getComparisonResult(api.data.debugLog.results);
        var translatedMessages = api.state.translatedMessages;
        result[0].name.value = translatedMessages.roles;
        result[1].name.value = translatedMessages.securityAttribute;
        result[2].name.value = translatedMessages.condition;
        result[3].name.value = translatedMessages.controlledByReferences;
        result[4].name.value = translatedMessages.script;

        pListCtrl.update(result);
        props.pageReady = true;

        api.data.sysSecurityACLRole.refresh();
    }

    // -------------------------------------------------------------------------------- //
    function sysSecurityACLRole() {
        var roles = api.data.sysSecurityACLRole.output.data.GlideRecord_Query.sys_security_acl_role._results.map(row => row.sys_user_role.value);
        api.data.sysSecurityACLRole.output.data.GlideRecord_Query.sys_security_acl_role._results = null;
        props.hasACL = roles.length > 0;

        if (props.hasACL) {
            refreshSysUserHasRole(roles);
        }
    }

    function refreshSysUserHasRole(roles) {
        let aaCommonDBPayload = {};
        aaCommonDBPayload.baseUserId = props.baseUserId;
        aaCommonDBPayload.modelUserId = props.modelUserId;
        aaCommonDBPayload.roleList = roles;
        aaCommonDBPayload.action = "sysUserHasRole";
        api.setState("aaCommonDBPayload", aaCommonDBPayload);
    }

    function aaCommonDBSuccessHandler() {
        if (api.data.aaCommonDB.output.request.action === "sysUserHasRole") {
            props.userHasRequiredRoles = api.data.aaCommonDB.output.response;
        }
    }

}
