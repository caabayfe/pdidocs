function include({ imports }, api, helpers) {

    function getApiAction(action) {
        const actions = {
            "add-role": "rolesToAssign",
            "remove-role": "rolesToRemove",
            "add-group": "groupsToAssign",
            "remove-group": "groupsToRemove"
        };
        return actions[action];
    }

    function updateState(objKey, key, value) {
        let data = value == undefined ? key : {
            [key]: value
        };
        api.setState(objKey, ctx => ({
            ...ctx.currentValue,
            ...data
        }));
    }

    // use this if value of objKey in state is a array
    function updateArrayState(objKey, ...data) {
        api.setState(objKey, ctx => ([
            ...ctx.currentValue,
            ...data
        ]));
    }

    function updateComponentProps(key, value) {
        updateState("componentProps", key, value);
    }

    async function showLoader(message) {
        let msg = message || await helpers.translate("Loading...");
        updateState("loader", {
            visible: true,
            message: msg
        });
    }

    function hideLoader() {
        updateState("loader", "visible", false);
    }

    function emitActionPerformed(eventName, eventPayload) {
        api.emit('SIMULATOR_ACTION_PERFORMED', {
            eventName,
            eventPayload
        });
    }

    function updateScreenStatus(isDirty = true) {
        api.emit("SCREEN_STATUS_CHANGED", {
            isDirty
        });
    }

    function addNotification(header, content, status = "positive", icon = "circle-check-outline", actionType = "dismiss", actionLabel = null) {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "pageNotification",
                status: status,
                icon: icon,
                header: header,
                content: content,
                action: {
                    type: actionType,
                    label: actionLabel
                }
            }]
        });
    }

    function removeNotification(id = null) {
        api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
            items: [{
                id: id || "pageNotification"
            }]
        });
    }

    function hasServerError(event) {
        return event.name == "DATA_OP_FAILED" || event.name == "DATA_FETCH_FAILED";
    }

    async function showPageError(header = null, content = null) {
        header = header || await helpers.translate("Server Error:");
        content = content || await helpers.translate("The server encountered an internal error and couldn't process your request. Please try again after sometime.")
        addNotification(header, content, "critical", "circle-info-outline")
    }

    function hidePageError() {
        removeNotification("pageNotification");
    }

    function getSimulatedResult(dataBrokerName, userSysId, tableName, recordSysId, fieldSysId, action, roleOrGroupSysId, includeDetails = true) {
    	_callApi(dataBrokerName, "getSimulatedResult", userSysId, tableName, recordSysId, fieldSysId, action, roleOrGroupSysId, includeDetails);
    }

    function getDebugLog(dataBrokerName, userSysId, tableName, recordSysId, fieldSysId, includeDetails = true) {
    	_callApi(dataBrokerName, "getAccessResult", userSysId, tableName, recordSysId, fieldSysId, null, null, includeDetails);
    }

    function getSimulatedChanges(dataBrokerName, userSysId, action, roleOrGroupId) {
        updateComponentProps("serverError", null);
        let act = getApiAction(action);
        api.data[dataBrokerName].execute({
            action: 'getAccessSimulatorChanges',
            payload: {
            	[act]: [roleOrGroupId],
                userSysId: userSysId
            }
        });
    }

    function _callApi(dataBrokerName, apiName, userSysId, tableName, recordSysId, fieldSysId, action, roleOrGroupSysId, includeDetails) {
        let operations = ["read", "write", "create",
            "report_view", "report_on",
            "list_edit", "add_to_list",
            "save_as_template", "personalize_choices",
            "query_match", "query_range"
        ];

        if (!fieldSysId) {
            operations.push("delete");
        }

        let req = {
            entitySysId: userSysId,
            entityType: "USER",
            targetName: tableName,
            targetResource: "RECORD",
            targetField: fieldSysId,
            targetRecord: recordSysId,
            targetMethod: "",
            targetOperations: operations
        };

        if (action && roleOrGroupSysId)
            req[action] = roleOrGroupSysId;

        api.data[dataBrokerName].execute({
            action: apiName,
            payload: {
                request: req,
                includeDetails: includeDetails
            }
        })
    }

    function execute(fnMap, event) {
        const fn = fnMap[event.elementId] || fnMap[event.name];
        if (fn)
            fn();
    }

    return {
        getApiAction,
        updateState,
        updateArrayState,
        updateComponentProps,
        showLoader,
        hideLoader,
        emitActionPerformed,
        updateScreenStatus,
        addNotification,
        removeNotification,
        showPageError,
        hidePageError,
        hasServerError,
        getSimulatedResult,
        getDebugLog,
        getSimulatedChanges,
        execute
    }
}
