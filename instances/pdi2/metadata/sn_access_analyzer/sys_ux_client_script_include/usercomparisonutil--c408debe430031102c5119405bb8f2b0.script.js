function include({imports}, api, helpers) {

    const PASS_ICON = 'circle_check_outline';
    const FAIL_ICON = 'ban_fill';
    const WARNING_ICON = 'diamond_exclamation_outline';

    const URL_HOME = 'now/access-management/overview';
    const URL_ACCESS_ANALYZER = 'now/access-management/access-analyzer';
    const URL_ALL_OPERATION = '/now/access-management/compare-user/';
    const URL_DEBUG_LOGS = '/now/access-management/compare-user-debug-logs/';
    const URL_ACL_DETAILS = '/now/access-management/compare-user-acl-details/';

    const pageParams = api ? api.context.props : null;
    var props = api ? api.state.props || {} : null;

    // -------------------------------------------------------------------------------- //

    const EvalStatus = Object.freeze({

        PASSED: {
            label: 'Passed', icon: PASS_ICON, color: 'positive', value: 'PASSED'
        },
        PASSED_MAYBE: {
            label: 'Passed', icon: WARNING_ICON, color: 'high', value: 'PASSED_MAYBE'
        },
        BLOCKED: {
            label: 'Blocked', icon: FAIL_ICON, color: 'critical', value: 'BLOCKED'
        },
        BLOCKED_MAYBE: {
            label: 'Blocked', icon: WARNING_ICON, color: 'high', value: 'BLOCKED_MAYBE'
        },
        SKIPPED: {
            label: 'Skipped', icon: '', color: 'green-yellow', value: 'SKIPPED'
        },
        UNDEFINED: {
            label: 'Undefined', icon: '', color: '', value: 'UNDEFINED'
        },
        NONE: {
            label: '', icon: '', color: '', value: 'NONE'
        },
        HAS_ROLE: {
            label: 'Has role', icon: PASS_ICON, color: 'positive', value: 'HAS_ROLE'
        },
        HAS_GROUP: {
            label: 'Has group', icon: PASS_ICON, color: 'positive', value: 'HAS_GROUP'
        },
        ROLE_NOT_GRANTED: {
            label: 'Role not granted', icon: FAIL_ICON, color: 'critical', value: 'ROLE_NOT_GRANTED'
        },
        GROUP_NOT_GRANTED: {
            label: 'Group not granted', icon: FAIL_ICON, color: 'critical', value: 'GROUP_NOT_GRANTED'
        },
        APPLIED: {
            label: 'Applied', icon: PASS_ICON, color: 'positive', value: 'APPLIED'
        },
        NOT_APPLIED: {
            label: 'Not Applied', icon: 'circle-close-outline', color: 'low', value: 'NOT_APPLIED'
        },
        get: (value) => {
            if(isEmpty(value)) {
                return EvalStatus.NONE;
            }
            value = value.toUpperCase();
            return EvalStatus.hasOwnProperty(value) ? EvalStatus[value] : EvalStatus.NONE;
        },
        translate: () => {
            var tms = api.state.translatedMessages;
            helpers.translate("Passed").then(v => {
                tms.PASSED = v;
                tms.PASSED_MAYBE = v;
            });
            helpers.translate("Blocked").then(v => {
                tms.BLOCKED = v;
                tms.BLOCKED_MAYBE = v;
            });
            helpers.translate("Skipped").then(v => tms.SKIPPED = v);
            helpers.translate("Undefined").then(v => tms.UNDEFINED = v);
            helpers.translate("Has role").then(v => tms.HAS_ROLE = v);
            helpers.translate("Has group").then(v => tms.HAS_GROUP = v);
            helpers.translate("Role not granted").then(v => tms.ROLE_NOT_GRANTED = v);
            helpers.translate("Group not granted").then(v => tms.GROUP_NOT_GRANTED = v);
            helpers.translate("Applied").then(v => tms.APPLIED = v);
            helpers.translate("Not Applied").then(v => tms.NOT_APPLIED = v);
        },
        getTranslatedText: (status) => {
            return api.state.translatedMessages[status.value];
        }
    });
    
    // -------------------------------------------------------------------------------- //
    function setRequestInfo(request) {
        Promise.all([
            helpers.translate("User 1"),
            helpers.translate("User 2"),
            helpers.translate("Table"),
            helpers.translate("Record"),
            helpers.translate("Field"),
            helpers.translate("Operation"),
            helpers.translate("{0}", request.operation),
            helpers.translate("ACL name"),
            helpers.translate("Decision type"),
            helpers.translate("{0}", request.decisionType),
            helpers.translate("Applies to condition"),
            helpers.translate("{0}", request.appliesToCondition),
            helpers.translate("Empty"),
            helpers.translate("{0}", request.empty),
            helpers.translate("Required role(s)"),
            helpers.translate("View"),
            helpers.translate("Date executed")
        ]).then(labels => {
            _setRequestInfo(request, {
                user1: labels[0],
                user2: labels[1],
                table: labels[2],
                record: labels[3],
                field: labels[4],
                operationLabel: labels[5],
                operationValue: labels[6],
                aclName: labels[7],
                decisionTypeLabel: labels[8],
                decisionTypeValue: labels[9],
                appliesToConditionLabel: labels[10],
                appliesToConditionValue: labels[11],
                emptyLabel: labels[12],
                emptyValue: labels[13],
                requiredRoles: labels[14],
                view: labels[15],
                dateExecuted: labels[16],
            })
        })
    }
    
    // -------------------------------------------------------------------------------- //

    const _setRequestInfo = (request, label) => {

        var req = [];

        addRequestInfo(req, label.user1, request.baseUser.name, navTo("sys_user", request.baseUser.id));
        addRequestInfo(req, label.user2, request.modelUser.name, navTo("sys_user", request.modelUser.id));

        if (request.resourceType) {
            addRequestInfo(req, label.table, request.targetTableLabel + ' [' + request.targetTableName + ']');
            addRequestInfo(req, label.record, request.targetRecordLabel);
            addRequestInfo(req, label.field, request.targetFieldLabel);
        }

        if (request.operation) {
            addRequestInfo(req, label.operationLabel, label.operationValue);
        }

        if (request.aclId) {
            addRequestInfo(req, label.aclName, request.aclName, navTo("sys_security_acl", request.aclId));
        }

        if(request.decisionType) {
             addRequestInfo(req, label.decisionTypeLabel, label.decisionTypeValue);
        }

        if(request.appliesToCondition) {
             addRequestInfo(req, label.appliesToConditionLabel, label.appliesToConditionValue);
        }

        if(request.empty) {
             addRequestInfo(req, label.emptyLabel, label.emptyValue);
        }

        if (request.hasOwnProperty("requiredRoles")) {
            addRequestInfo(req, label.requiredRoles, label.view, "javascript:void(0);", false, "viewRoles", false);
        }

        addRequestInfo(req, label.dateExecuted, request.lastRun);

        req[0].userId = request.baseUser.id;
        req[1].userId = request.modelUser.id

        api.setState('request', req);
    }


    function navTo(uri, sysId) {
        return "nav_to.do?uri=" + uri + ".do?sys_id=" + sysId;
    }

    function navToList(table, params) {
        return "nav_to.do?uri=" + table + "_list.do?".concat(encodeURIComponent(params));
    }

    // -------------------------------------------------------------------------------- //

    function addRequestInfo(req, label, value, href, openNewWindow = true, action="", showIcon = true) {
        if (isEmpty(value)) {
            return;
        }

        if (href == null) {
            req.push({
                label: label,
                value: {
                    type: "string",
                    value: value
                }
            });
        } else {
            req.push({
                label: label,
                value: {
                    href: href,
                    iconEnd: showIcon ? "open-link-right-outline" : "",
                    opensWindow: openNewWindow,
                    showIcon: showIcon,
                    type: "text-link",
                    underlined: false,
                    label: value,
                    action: action,
                    variant: "primary"
                }
            });
        }
    }

    // -------------------------------------------------------------------------------- //

    const updateBreadcrumb = (request, labels) => {
        var hrefs = [
            URL_HOME,
            URL_ACCESS_ANALYZER, 
            URL_ALL_OPERATION + request.baseUser.requestId + "/" + request.modelUser.requestId,
            URL_DEBUG_LOGS + pageParams.baseUserResultId + "/" + pageParams.modelUserResultId,
            URL_ACL_DETAILS + pageParams.baseUserResultId + "/" + pageParams.modelUserResultId + '/' +  //
            (pageParams.baseUserDebugLogId || 0) + '/' + (pageParams.modelUserDebugLogId || 0),
            null
        ]
        api.setState('breadcrumbItems', labels.map((v, i) => ({ label: v, href: hrefs[i] })));
    }


    // -------------------------------------------------------------------------------- //
    const _mapRequest = (request) => {
        const isResultTable = request.baseUser.access_analyzer_request;

        var req = isResultTable ? request.baseUser.access_analyzer_request._reference : request.baseUser;
        var obj = {
            resourceType: req.resource_type.displayValue,
            targetTableName: req.target_table.value,
            targetTableLabel: req.target_table.displayValue,
            targetRecordId: req.target_record.value,
            targetRecordLabel: _getTargetRecordLabel(req.target_record.displayValue),
            targetFieldName: req.target_field.value,
            targetFieldLabel: req.target_field.displayValue,
            lastRun: req.last_run.displayValue,
            baseUser: {
                id: req.user.value,
                name: req.user.displayValue,
                requestId: req.sys_id.value
            }
        };
        req = isResultTable ? request.modelUser.access_analyzer_request._reference : request.modelUser;
        obj.modelUser = {
            id: req.user.value,
            name: req.user.displayValue,
            requestId: req.sys_id.value
        }
        return obj;
    }

    function _getTargetRecordLabel(label) {
        // targetRecord is a document id field and is of format Incident: INC0000004, Extract only the record value for display
        return isEmpty(label) ? "" : label.replace(/(.*):\s*/, "");
    }
    // -------------------------------------------------------------------------------- //

    function _mapRequestInfo({ request, result, debugLog }) {

        let req = getUserObject(request, row => row._row_data.uniqueValue == api.context.props.baseUserRequestId ? "baseUser" : "modelUser");
        let res = getUserObject(result, row => row._row_data.uniqueValue == api.context.props.baseUserResultId ? "baseUser" : "modelUser");
        let log = getUserObject(debugLog, row => row._row_data.uniqueValue == api.context.props.baseUserDebugLogId ? "baseUser" : "modelUser");

        var reqMap = _mapRequest(request != undefined ? req : res);

        if (result != undefined) {
            reqMap.operation = res.baseUser.operation.displayValue;
        }

        if (debugLog != undefined) {
            log = log.baseUser || log.modelUser;
            reqMap.aclId = log.record_ref.value;
            reqMap.aclName = log.record_ref.displayValue;
            reqMap.decisionType = log.decision_type.displayValue;
            reqMap.appliesToCondition = log.applies_to_condition_result.displayValue;
            reqMap.empty = log.empty.displayValue;
            reqMap.requiredRoles = log.roles ? log.roles.value : "";
        }

        return reqMap;
    }

    // -------------------------------------------------------------------------------- //

    const setHeader = ({ request, result, debugLog, screenIndex }) => {
        if (isEmpty(request) && isEmpty(result) && isEmpty(debugLog)) {
            return;
        }
        var reqInfo = _mapRequestInfo({ request, result, debugLog });
        props.requestInfo = reqInfo;
        setRequestInfo(reqInfo);
        _translateTitle(reqInfo, screenIndex).then(labels => {
            updateBreadcrumb(reqInfo, labels);
            _setTitle(labels[labels.length - 1]);
        });
        return reqInfo;
    }

    // -------------------------------------------------------------------------------- //
    function _setTitle(title) {
        props.title = title;
        api.setState("props", { ...props });
    }

    // -------------------------------------------------------------------------------- //

    function _translateTitle(request, screen) {
        let promises = [];
        switch (screen) {
            case 4:
                promises.unshift(helpers.translate("Showing role hierarchy"));
            case 3:
                promises.unshift(request.aclName);
            case 2:
                promises.unshift(helpers.translate("{0} operation", request.operation.charAt(0).toUpperCase() + request.operation.slice(1)));
            case 1:
                promises.unshift(helpers.translate("Comparing {0} to {1}: access controls", request.baseUser.name, request.modelUser.name));
        }
        promises.unshift(helpers.translate("Access Analyzer"));
        promises.unshift(helpers.translate("Overview"));
        return Promise.all(promises);
    }

    // -------------------------------------------------------------------------------- //

    const isEmpty = (obj) => obj == undefined || obj == null || obj == '';

    // -------------------------------------------------------------------------------- //
    const getUserObject = (array, callback) => {
        var obj = { baseUser: null, modelUser: null };
        if (isEmpty(array)) {
            return obj;
        }
        array.forEach(row => obj[callback(row)] = row);
        return obj;
    }

    // -------------------------------------------------------------------------------- //
    const EmptyState = {

        show: ({ heading, content = "", illustration = "no-data", actions }, name = "emptyState") => {
            var stat = {...api.state[name]};
            var emptyState = stat.emptyState ? stat.emptyState : stat;
            emptyState.show = true;
            emptyState.heading.label = heading;
            emptyState.content = content;
            emptyState.illustration = illustration;
            if (actions != undefined) {
                emptyState.actions = actions;
            }
            api.setState(name, ({currentValue}) => {
                if(stat.emptyState){
                    return {...currentValue, emptyState}
                }
                return {...currentValue, ...emptyState}
            });
        },

        // -------------------------------------------------------------------------------- //
        hide: (name = "emptyState") => {
            var stat = {...api.state[name]};
            var emptyState = stat.emptyState ? stat.emptyState : stat;
            emptyState.show = false;
            api.setState(name, stat)
        },

        // -------------------------------------------------------------------------------- //
        showNoDataMessage: (name = "emptyState") => {
            _loadAndFill(api.state[name].messages.noData, [
                helpers.translate("Sorry, we couldn't find any results"),
                helpers.translate("You can refresh the page and try again")
            ])
                .then(obj => EmptyState.show(obj, name));
        },

        // -------------------------------------------------------------------------------- //
        showServerErrorMessage: (name = "emptyState") => {
            _loadAndFill(api.state[name].messages.serverError, [
                helpers.translate("The server encountered an internal error and couldn't process your request"),
                helpers.translate("You can refresh the page and try again")
            ])
                .then(obj => EmptyState.show(obj, name));
        }

    }


    // -------------------------------------------------------------------------------- //
    function _loadAndFill(obj, arr) {
        return new Promise(res => {
            if (!isEmpty(obj.heading)) {
                res(obj);
                return;
            }
            Promise.all(arr).then(values => {
                obj.heading = values[0];
                obj.content = values[1];
                res(obj);
            })
        });
    }

    // -------------------------------------------------------------------------------- //

    function navigate({ route, fields, params, redirect = false, passiveNavigation, targetRoute, external, title }) {
        external = external ? { url: external } : null;
        helpers.navigate.to(route, fields, params, redirect, passiveNavigation, targetRoute, external, title);
    }

    // -------------------------------------------------------------------------------- //

    function showServerError() {
        props.loadingState = false;
        EmptyState.showServerErrorMessage();
    }

    return {
        EvalStatus,
        props,
        setHeader,
        pageParams,
        isEmpty,
        getUserObject,
        navTo,
        navToList,
        setRequestInfo,
        EmptyState,
        navigate,
        showServerError,
        addRequestInfo
    }
}
