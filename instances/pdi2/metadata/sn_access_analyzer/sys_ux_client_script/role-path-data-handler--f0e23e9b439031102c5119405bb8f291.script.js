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

    const aaUtil = imports["sn_access_analyzer.AccessanalyzerUIUtil"](api, helpers);
    const insightsUtil = imports["sn_access_analyzer.AccessInsightsUtil"](api, helpers);
    var props = api.state.props;

    function dbResponseHandler() {
        if (hasServerError()) {
            showServerError();
            return;
        }

        api.setState("dbResponses", ctx => {
            var cv = [...ctx.currentValue];
            cv.push(event.elementId);
            aaUtil.log("dbResponseHandler : ", cv.join(','));
            if (cv.length === 2) {
                checkAndLoadAclRoles();
            }
            return cv;
        });
    }

    function checkAndLoadAclRoles() {
        aaUtil.log("All db data (accessResult,debugLog) loaded successfully");

        if (api.data.accessResult.results.length < 2 || api.data.debugLog.results.length === 0) {
            showServerError();
            return;
        }

        const {setHeader, getUserObject} = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);
        setHeader({
            result: api.data.accessResult.results,
            debugLog: api.data.debugLog.results,
            screenIndex: 4
        });

        const debugLog = getUserObject(api.data.debugLog.results, row => {
            return row._row_data.uniqueValue === api.context.props.baseUserDebugLogId ? 'baseUser' : 'modelUser';
        });

        _updateRoleStatus(debugLog);

        props.aclId = debugLog.baseUser != null ? debugLog.baseUser.record_ref.value : debugLog.modelUser.record_ref.value;
        api.setState("props", {...props});
        api.data.sysSecurityAclRole.refresh();

    }

    function _updateRoleStatus(debugLog) {
        var baseUser = api.state.baseUser;
        baseUser.id = props.requestInfo.baseUser.id;
        baseUser.name = props.requestInfo.baseUser.name;
        baseUser.roleStatus = debugLog.baseUser != null ? debugLog.baseUser.roles_result.value : null;

        var modelUser = api.state.modelUser;
        modelUser.id = props.requestInfo.modelUser.id;
        modelUser.name = props.requestInfo.modelUser.name;
        modelUser.roleStatus = debugLog.modelUser != null ? debugLog.modelUser.roles_result.value : null;

        aaUtil.log("Role status Base User : ", baseUser.roleStatus, ", Model User", modelUser.roleStatus);

        api.setState("baseUser", {...baseUser});
        api.setState("modelUser", {...modelUser});
    }

    function sysSecurityAclRoleResponseHandler() {
        aaUtil.log("sysSecurityAclRoleResponseHandler: ", event.name);
        if (hasServerError()) {
            showServerError();
            return;
        }

        const {getUserObject} = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);
        const debugLog = getUserObject(api.data.debugLog.results, row => {
            return row._row_data.uniqueValue === api.context.props.baseUserDebugLogId ? 'baseUser' : 'modelUser';
        });

        let roles = api.data.sysSecurityAclRole.results;
        props.hasACLs = (roles && roles.length > 0);

        if (!props.hasACLs) {
            showServerError();
            return;
        }

        // Show 2nd tab if Model user got passed and Base user blocked
        if ((debugLog.modelUser && debugLog.modelUser.status.value === "passed") &&
            (debugLog.baseUser == null || (debugLog.baseUser && debugLog.baseUser.status.value !== "passed"))) {
            aaUtil.log("Switch to tab-2, since base user blocked");
            props.selectedTabIndex = 1;
            api.setState("props", {...props});
        }

        api.emit("ACE_ACTION_PERFORMED", {
            selectedTabIndex: props.selectedTabIndex
        });

    }

    function nodeMapResponseHandler() {
        aaUtil.log("nodeMapResponseHandler: ", event.name);
        if (hasServerError()) {
            showServerError();
            return;
        }

        let output = api.data.ucDataBroker.output;
        let userType = output.request.userType;
        let data = output.response || [];
        _updateNodeMap(api.state[userType], data);

        if(!api.context.session.user.roles.includes('admin')) {
            return;
        }
        
        let insightsUser = userType === "baseUser" ? api.state.modelUser : api.state.baseUser;

        if(data.length === 0 || data.errorCode) {
            insightsUtil.showNoData(userType + 'Widget',insightsUser.name);
            return;
        }

        let gr = getGroupAndRoles(output);
        insightsUtil.updateInsights(userType + 'Widget', {
            payload: {
                userId: insightsUser.id,
                groups: gr.groups,
                roles: gr.roles,
                userName: insightsUser.name
            }
        });
    }

    function getGroupAndRoles({request: {targetRoles},response}) {
        let roleList = [];
        let groupMap = {};
        response.forEach(role => {
            if(role.assignmentTypes.includes('DIRECT') || targetRoles.includes(role.id)){
                roleList.push({
                    id: role.id,
                    name: role.name
                });
            }
            
            let contGroups = role.containingGroups || [];
            contGroups.forEach(group => groupMap[group.id] = {
                id: group.id,
                name: group.name
            });
        });
        return {
            roles: roleList,
            groups: Object.values(groupMap),
        };
    }

    function _updateNodeMap(user, data) {
        const {updateMap} = imports["sn_access_analyzer.UserRoleMapUtil"](api, helpers);
        user.status = 'rendered';
        api.setState(user.type, {...user});
        updateMap(user, data);
    }

    function showServerError() {
        aaUtil.log("Invalid data, show server error");
        props.hasServerError = true;
        api.setState("props", {...props});
        const mapUtil = imports["sn_access_analyzer.UserRoleMapUtil"](api, helpers);
        mapUtil.showServerError();
        insightsUtil.showServerError("baseUserWidget");
        insightsUtil.showServerError("modelUserWidget");
    }

    function hasServerError() {
        return event.name.endsWith('FAILED');
    }

    const fnMap = {
        accessResult: dbResponseHandler,
        debugLog: dbResponseHandler,
        sysSecurityAclRole: sysSecurityAclRoleResponseHandler,
        ucDataBroker: nodeMapResponseHandler
    };

    const fn = fnMap[event.elementId || event.name];
    if (fn)
        fn();
}
