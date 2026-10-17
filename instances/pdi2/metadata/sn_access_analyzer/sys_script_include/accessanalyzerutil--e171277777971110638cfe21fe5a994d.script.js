var AccessAnalyzerUtil = Class.create();
AccessAnalyzerUtil.prototype = {
    LogType: {
        ACCESS_HANDLER: 'AccessHandlerInfo',
        BUSINESS_RULE: 'BusinessRuleInfo',
        DATA_FILTRATION: 'DataFiltrationInfo',
        SECURITY_RULE: 'SecurityRulesInfo',
        SECURITY_DATA_FILTER: 'SecurityDataFilterInfo'
    },
    EvalStatus: {
        TRUE: "true",
        FALSE: "false",
        NOT_EVALUATED: "not_evaluated"
    },
    UIStatus: {
        PASSED: "passed",
        BLOCKED: "blocked",
        SKIPPED: "skipped",
        UNDEFINED: "undefined",
        APPLIED: "applied",
        NOT_APPLIED: "not_applied"
    },

    DECISION_MODE: {
        FILTER_IF: 'filter_if',
        FILTER_UNLESS: 'filter_unless'
    },
    initialize: function() {},

    saveRequest: function(requestObj) {
        var requestGR = new GlideRecord("sn_access_analyzer_request");
        requestGR.initialize();
        requestGR.setValue("analyze_by", requestObj.analyze_by);
        requestGR.setValue("user", requestObj.user);
        requestGR.setValue("group", requestObj.group);
        requestGR.setValue("role", requestObj.role);
        requestGR.setValue("resource_type", requestObj.resource_type);
        requestGR.setValue("target_table", requestObj.target_table);
        requestGR.setValue("target_record", requestObj.target_record);
        requestGR.setValue("target_field", requestObj.target_field);
        requestGR.setValue("target_client_callable_script_include", requestObj.target_client_callable_script_include);
        requestGR.setValue("target_rest_endpoint", requestObj.target_rest_endpoint);
        requestGR.setValue("target_rest_endpoint_method", requestObj.target_rest_endpoint_method);
        requestGR.setValue("target_ui_page", requestObj.target_ui_page);
        requestGR.setValue("operations", requestObj.operations);
        requestGR.setValue("short_description", requestObj.short_description);
        requestGR.setValue("last_run", requestObj.last_run);
        requestGR.setValue("evaluated_using", requestObj.evaluated_using);
        requestGR.insert();
        return requestGR;
    },

    saveResult: function(resp, accessRequestGR) {
        var parsedResp = this.parseResponse(JSON.parse(resp));
        var operations = parsedResp.request.targetOperations;
        var executionTime = accessRequestGR.last_run;
        var accessRequestId = accessRequestGR.sys_id.toString();
        for (var i = 0; i < operations.length; i++) {
            var operation = operations[i].toLowerCase();
            var resultId = this._saveAccessResult(accessRequestGR, parsedResp, operation, executionTime);
            this._saveDebugLogs(parsedResp.securityDebug, operation, resultId, accessRequestId);
        }
    },

    _getAdminOverrideApplied: function(apiResponse, operationDebug, accessRequestGR, operation) {
        // Only return n/a if there are no debug logs to check
        if (!operationDebug || !operationDebug.debugLogs)
            return "n/a";


        if (accessRequestGR.resource_type.toString() !== "record" || !apiResponse.request.targetRecord)
            return "n/a";

        var table = apiResponse.request.targetName;
        var field = apiResponse.request.targetField;

        var path = "record/" + table + (field ? "." + field : "") + "/" + operation;
        for (var i = 0; i < operationDebug.debugLogs.length; i++) {
            var debug = operationDebug.debugLogs[i];
            if (debug && debug.path && debug.path === path)
                return debug.isCumulativeOverride ? "yes" : "no";
        }
        return "n/a";
    },

    _saveAccessResult: function(accessRequestGR, apiResponse, operation, executionTime) {
        var accessResultGR = new GlideRecord("sn_access_analyzer_access_result");
        accessResultGR.initialize();
        accessResultGR.setValue("access_analyzer_request", accessRequestGR.sys_id.toString());
        accessResultGR.setValue("execution_time", executionTime);
        accessResultGR.setValue("analyzed_by", accessRequestGR.analyzed_by);
        accessResultGR.setValue("operation", operation);
        if (accessResultGR.isValidField("record_available") && apiResponse.detail.hasOwnProperty("isRecordAvailable")) {
            accessResultGR.setValue("record_available", apiResponse.detail.isRecordAvailable === "true" ? "yes" : "no");
        }
        var operationSecurityDebug = apiResponse.securityDebug[operation];
        const keyMap = {
            admin_override_applied: "adminOverrideApplied",
            overall_access: "overallAccess",
            read_only_field: "readOnlyField",
            insights: "insights",
            accesshandler_result: "accessHandlerResult",
            datafiltration_result: "datafiltrationResult",
            acl_result: "aclResult"
        };

        accessResultGR.setValue("script_execution", operationSecurityDebug.containsScriptedACL ? "ACL" : null);

        for (const [key, value] of Object.entries(keyMap)) {
            if (operationSecurityDebug.hasOwnProperty(value))
                accessResultGR.setValue(key, operationSecurityDebug[value]);
        }

        accessResultGR.setValue('security_data_filter_result', this._getSecurityDataFilterStatus(operationSecurityDebug));

        return accessResultGR.insert();
    },

    _getSecurityDataFilterStatus: function(oprObject) {
        var dlLen = oprObject.debugLogs.length;
        var applied = 0;
        var notApplied = 0;
        for (var i = 0; i < dlLen; i++) {
            var dl = oprObject.debugLogs[i];
            if (dl.logType === this.LogType.SECURITY_DATA_FILTER) {
                if (dl.applicable) {
                    applied++;
                } else {
                    notApplied++;
                }
            }
        }
        if (applied > 0) {
            return this.UIStatus.APPLIED;
        }
        if (notApplied > 0) {
            return this.UIStatus.NOT_APPLIED;
        }
        return this.UIStatus.UNDEFINED;
    },

    _populateResultsForReadOnlyField: function(oprName, operation, targetField) {
        operation.insights = "The field " + targetField + " is read only. " +
            oprName + " operation is not allowed for read only fields";
        operation.accesshandler_result = this.UIStatus.SKIPPED;
        operation.datafiltration_result = this.UIStatus.SKIPPED;
        operation.acl_result = this.UIStatus.SKIPPED;
    },

    _saveBRDebugLog: function(dfLog, accessResultRef, accessRequestId) {
        var brDebugLogGR = new GlideRecord("sn_access_analyzer_debug_log");
        brDebugLogGR.initialize();
        brDebugLogGR.setValue("access_analyzer_request", accessRequestId);
        brDebugLogGR.setValue("access_result", accessResultRef);
        brDebugLogGR.setValue("log_table_name", 'sys_script');
        brDebugLogGR.setValue("record_ref", dfLog.recordRef);
        brDebugLogGR.setValue("type", dfLog.type);
        brDebugLogGR.log_time.setDisplayValue(dfLog.time);
        brDebugLogGR.setValue("log_sequence", dfLog.log_sequence);
        brDebugLogGR.insert();
    },

    _saveDFDebugLog: function(dfLog, accessResultRef, accessRequestId) {
        var dfDebugLogGR = new GlideRecord("sn_access_analyzer_debug_log");
        dfDebugLogGR.initialize();
        dfDebugLogGR.setValue("access_analyzer_request", accessRequestId);
        dfDebugLogGR.setValue("access_result", accessResultRef);
        dfDebugLogGR.setValue("log_table_name", 'sys_df_data_filtration');
        dfDebugLogGR.setValue("record_ref", dfLog.recordRef);
        dfDebugLogGR.setValue("path", dfLog.path);
        dfDebugLogGR.setValue("type", dfLog.type);
        dfDebugLogGR.log_time.setDisplayValue(dfLog.time);
        dfDebugLogGR.setValue("log_sequence", dfLog.log_sequence);
        dfDebugLogGR.setValue("status", dfLog.status);
        dfDebugLogGR.insert();
    },

    _saveACLDebugLogs: function(debugLog, accessResultRef, accessRequestId) {
        var _this = this;
        var acls = debugLog.acls;
        if (!acls) {
            return;
        }
        acls.forEach(function(acl) {
            _this._saveACLDebugLog(acl, debugLog.time, accessResultRef, accessRequestId);
        });
    },

    _saveSecurityDataFilter: function(debugLog, accessResultRef, accessRequestId) {
        var sdfGR = new GlideRecord("sn_access_analyzer_debug_log");
        sdfGR.initialize();
        sdfGR.setValue("access_analyzer_request", accessRequestId);
        sdfGR.setValue("access_result", accessResultRef);
        sdfGR.setValue("status", debugLog.status);
        sdfGR.setValue("log_sequence", debugLog.log_sequence);
        sdfGR.setValue("log_table_name", 'sys_security_data_filter');
        sdfGR.setValue("type", debugLog.type);
        sdfGR.setValue("record_ref", debugLog.recordRef);
        sdfGR.setValue("decision_type", this._getDecisionMode(debugLog.dataFilterResult.mode));
        sdfGR.insert();
    },
	
    _saveACLDebugLog: function(acl, logTime, accessResultRef, accessRequestId) {
        var aclDebugLogGR = new GlideRecord("sn_access_analyzer_debug_log");
        aclDebugLogGR.initialize();
        aclDebugLogGR.setValue("access_analyzer_request", accessRequestId);
        aclDebugLogGR.setValue("log_table_name", 'sys_security_acl');
        aclDebugLogGR.setValue("record_ref", acl.recordRef);
        aclDebugLogGR.setValue("access_result", accessResultRef);
        aclDebugLogGR.setValue("roles_result", acl.rolesResult);
        aclDebugLogGR.setValue("roles", acl.roles.join(", "));
        aclDebugLogGR.setValue("condition_result", acl.conditionResult);
        aclDebugLogGR.setValue("is_acl_customized", acl.isCustomized);
        aclDebugLogGR.setValue("script_result", acl.scriptResult);
        aclDebugLogGR.setValue("path", acl.path);
        aclDebugLogGR.setValue("applies_to", acl.appliesTo);
        aclDebugLogGR.setValue("type", "ACL");
        aclDebugLogGR.setValue("app", acl.app);
        aclDebugLogGR.log_time.setDisplayValue(logTime);
        aclDebugLogGR.setValue("log_sequence", acl.log_sequence);

        // Check if admin override is enabled and applied
        var adminOverrideEnabled = gs.getProperty('glide.security.admin.override.accessterm') === 'true';
        var accessResultGR = new GlideRecord("sn_access_analyzer_access_result");
        if (accessResultGR.get(accessResultRef)) {
            var overallAccess = accessResultGR.getValue("overall_access");
            var adminOverrideApplied = overallAccess === "passed" &&
                (acl.status === "blocked" || acl.securityAttributeResult === "blocked");

            // If admin override is applied, set status and security attribute to "passed"
            if (adminOverrideEnabled && adminOverrideApplied) {
                aclDebugLogGR.setValue("status", "passed");
                aclDebugLogGR.setValue("security_attribute", "passed");
            } else {
                aclDebugLogGR.setValue("status", acl.status);
                aclDebugLogGR.setValue("security_attribute", acl.securityAttributeResult);
            }
        } else {
            aclDebugLogGR.setValue("status", acl.status);
            aclDebugLogGR.setValue("security_attribute", acl.securityAttributeResult);
        }

        aclDebugLogGR.setValue("script_execution", acl.hasScript ? "Script" : null);
        aclDebugLogGR.setValue("decision_type", acl.aclDecisionType);
        aclDebugLogGR.setValue("applies_to_condition_result", acl.appliesToConditionResult);
        aclDebugLogGR.setValue("empty", acl.empty);
        aclDebugLogGR.setValue("controlled_by_references_result", acl.controlledByReferencesResult);
        return aclDebugLogGR.insert();
    },
	
    _saveDebugLogs: function(securityDebugInfo, operation, accessResultRef, accessRequestId) {
        var _this = this;
        var accessInfo = securityDebugInfo[operation];
        var debugLogs = accessInfo.debugLogs;
        if (!debugLogs) {
            gs.info("_saveDebugLogs : No debug log found for operation " + operation + " in accessRequestID: " + accessRequestId);
            return;
        }
        debugLogs.forEach(function(debugLog) {
            switch (debugLog.logType) {
                case _this.LogType.ACCESS_HANDLER:
                    _this._saveAccessHandlerDebugLog(debugLog, accessResultRef, accessRequestId);
                    break;
                case _this.LogType.BUSINESS_RULE:
                    _this._saveBRDebugLog(debugLog, accessResultRef, accessRequestId);
                    break;
                case _this.LogType.DATA_FILTRATION:
                    _this._saveDFDebugLog(debugLog, accessResultRef, accessRequestId);
                    break;
                case _this.LogType.SECURITY_RULE:
                    _this._saveACLDebugLogs(debugLog, accessResultRef, accessRequestId);
                    break;
                case _this.LogType.SECURITY_DATA_FILTER:
                    _this._saveSecurityDataFilter(debugLog, accessResultRef, accessRequestId);
                    break;
            }
        });
    },

    _saveAccessHandlerDebugLog: function(debugLog, accessResultRef, accessRequestId) {
        var accessHandlerDebugLogGR = new GlideRecord("sn_access_analyzer_debug_log");
        accessHandlerDebugLogGR.initialize();
        accessHandlerDebugLogGR.setValue("access_analyzer_request", accessRequestId);
        accessHandlerDebugLogGR.setValue("access_result", accessResultRef);
        accessHandlerDebugLogGR.setValue("path", debugLog.path);
        accessHandlerDebugLogGR.setValue("type", debugLog.type);
        accessHandlerDebugLogGR.setValue("applies_to", debugLog.appliesTo);
        accessHandlerDebugLogGR.log_time.setDisplayValue(debugLog.time);
        accessHandlerDebugLogGR.setValue("status", debugLog.status);
        accessHandlerDebugLogGR.setValue("log_sequence", debugLog.log_sequence);
        accessHandlerDebugLogGR.insert();
    },

    _getUIResultString: function(result) {
        if (!result)
            return "";
        var resultLC = result.toLowerCase();
        if (resultLC === this.EvalStatus.TRUE) {
            return this.UIStatus.PASSED;
        } else if (resultLC === this.EvalStatus.FALSE) {
            return this.UIStatus.BLOCKED;
        } else if (resultLC === this.EvalStatus.NOT_EVALUATED) {
            return this.UIStatus.SKIPPED;
        }
        return "";
    },

    _getCumulativeACLStatus: function(role, condition, script, aclSysId, securityAttr, controlledByReferencesResult) {
        var roleStatus = role.toLowerCase();
        var condStatus = condition.toLowerCase();
        var scriptStatus = script.toLowerCase();
        var controlledByReferencesResultStatus = controlledByReferencesResult.toLowerCase();
        var securityAttrStatus = securityAttr ? securityAttr.toLowerCase() : "";

        if (roleStatus === this.EvalStatus.TRUE && condStatus === this.EvalStatus.TRUE &&
            scriptStatus === this.EvalStatus.TRUE && securityAttrStatus === this.EvalStatus.TRUE && controlledByReferencesResultStatus === this.EvalStatus.TRUE) {
            return this.UIStatus.PASSED;
        }
        // For table level access check, condition and script will always be not evaluated
        // cumulative status should be based on role & security attribute status in this case
        if (roleStatus === this.EvalStatus.TRUE && securityAttrStatus !== this.EvalStatus.FALSE &&
            condStatus === this.EvalStatus.NOT_EVALUATED && scriptStatus === this.EvalStatus.NOT_EVALUATED && controlledByReferencesResultStatus === this.EvalStatus.NOT_EVALUATED) {
            return this.UIStatus.PASSED;
        }
        if (roleStatus === this.EvalStatus.NOT_EVALUATED && condStatus === this.EvalStatus.NOT_EVALUATED &&
            scriptStatus === this.EvalStatus.NOT_EVALUATED && securityAttrStatus === this.EvalStatus.NOT_EVALUATED && controlledByReferencesResultStatus === this.EvalStatus.NOT_EVALUATED) {
            return this.UIStatus.SKIPPED;
        }
        return this.UIStatus.BLOCKED;
    },

    // To determine an ACL with aclId has customisations from Customer. Below customisations are identified:
    // 1) Check for the changes on ACL fields 2) Addition/Modification of ACL roles 3) Removal of any ACL role
    _isAclCustomized: function(acl) {

        var aclId = acl.sysId;

        if (gs.getProperty("glide.identity.aclanalyzer.retrieve_acl_customization_info", "false").toString() !== "true")
            return "";

        // Check for the changes on ACL fields
        var gr = this._queryUpdateXml("sys_security_acl_" + aclId);
        if (gr.hasNext()) {
            return true;
        }

        var secAttrId = acl.securityAttribute;
        if (secAttrId) {
            gr = this._queryUpdateXml("sys_security_attribute_" + secAttrId);
            if (gr.hasNext()) {
                return true;
            }
        }

        // Addition/Modification of ACL roles
        var rolesIds = this._getAclRolesByAclId(aclId);
        gr = this._queryUpdateXml(rolesIds);
        if (gr.hasNext()) {
            return true;
        }

        // check for ACL role deletions
        gr = new GlideRecord("sys_metadata_delete");
        gr.addQuery("sys_parent", aclId);
        gr.query();

        return gr.hasNext();
    },

    _queryUpdateXml: function(name) {
        var gr = new GlideRecord("sys_update_xml");
        gr.addQuery("name", name);
        gr.addQuery("category", "customer");
        gr.query();
        return gr;
    },

    // Method to retrieve list of acl role Ids from the Acl Sys_id
    _getAclRolesByAclId: function(aclId) {
        var aclRole = new GlideRecord("sys_security_acl_role");
        aclRole.addQuery("sys_security_acl", aclId);
        aclRole.query();

        var rolesIds = [];
        while (aclRole.next()) {
            rolesIds.push("sys_security_acl_role_" + aclRole.sys_id.toString());
        }
        return rolesIds;
    },


    // Debug log transformation layer starts.

    //Method to find out whether an ACL actually has advance = true and a non-empty Script
    _setACLDetail: function(acl, operation, request) {

        acl.type = "ACL";
        acl.recordRef = acl.sysId;

        var aclName = acl.path.split("/")[1];
        acl.appliesTo = aclName.includes('.') ? "Field" : "Table";
        var gr = new GlideRecord("sys_security_acl");
        gr.addQuery("sys_id", acl.sysId);
        gr.query();
        var hasData = gr.next();

        if (hasData) {
            if (!gs.nil(gr.getValue("script")) && this._scriptAppliesForACLEvaluation(acl, operation, request)) {
                acl.hasScript = true;
            }
            acl.name = gs.getMessage("Access Control: {0}", gr.getValue("name"));
            acl.securityAttribute = gr.getValue("security_attribute");
        }
        acl.status = this._getCumulativeACLStatus(acl.rolesResult, acl.conditionResult,
            acl.scriptResult, acl.sysId, acl.securityAttributeResult, acl.controlledByReference.evalResult);
        acl.rolesResult = this._getUIResultString(acl.rolesResult);
        acl.conditionResult = this._getUIResultString(acl.conditionResult);
        acl.scriptResult = this._getUIResultString(acl.scriptResult);
        acl.securityAttributeResult = this._getUIResultString(acl.securityAttributeResult);
        acl.accessHandlerResult = this._getUIResultString(acl.accessHandlerResult);
        acl.isCustomized = this._isAclCustomized(acl);
        acl.aclDecisionType = this._getACLDecisionType(acl.aclDecisionType);
        acl.appliesToConditionResult = this._getAppliesToConditionResult(acl.appliesToConditionResult);
        acl.controlledByReferencesResult = this._getUIResultString(acl.controlledByReference.evalResult);
    },

    _scriptAppliesForACLEvaluation: function(aclObj, operation, request) {
        // scripts are not evaluated for query operations 
        if (operation === "query_match" || operation === "query_range") {
            return false;
        }

        // scripts are not evaluated if there is no context record
        if (request.targetResource === "RECORD" && !request.targetRecord) {
            return false;
        }

        return aclObj.scriptResult == "TRUE" || aclObj.scriptResult == "FALSE";
    },

    _getACLDecisionType: function(aclDecisionType) {
        if (aclDecisionType == "ALLOW_IF") {
            return "allow";
        }

        if (aclDecisionType == "DENY_UNLESS") {
            return "deny";
        }

        return "";
    },

    _getDecisionMode: function(mode) {
        switch (mode) {
            case 'IF':
                return this.DECISION_MODE.FILTER_IF;
            case 'UNLESS':
                return this.DECISION_MODE.FILTER_UNLESS;
            default:
                return "";
        }
    },

    _getAppliesToConditionResult: function(appliesToConditionResult) {
        if (appliesToConditionResult) {
            return appliesToConditionResult.toLowerCase();
        }

        return "";
    },

    _populateAccessInfo: function(oprName, apiResponse) {

        var operation = apiResponse.securityDebug[oprName];
        operation.overallAccess = operation.status ? this.UIStatus.PASSED : this.UIStatus.BLOCKED;
        if (apiResponse.request.targetResource === "RECORD" && !gs.nil(apiResponse.request.targetField)) {
            var readOnlyField = apiResponse.detail.readOnlyProperty === "true";
            operation.readOnlyField = readOnlyField ? "yes" : "no";
            operation.insights = "";
            if (oprName === "write" && readOnlyField) {
                this._populateResultsForReadOnlyField(oprName, operation, apiResponse.request.targetField);
                return;
            }

            if (oprName === "create" && readOnlyField) {
                operation.insights = "The field " + apiResponse.request.targetField + " is read only.";
            }
        }

        if (operation.logType === "AccessHandlerInfo") {
            if (operation.hasDataFiltration) {
                operation.accessHandlerResult = this.UIStatus.SKIPPED;
                operation.datafiltrationResult = operation.status ? this.UIStatus.PASSED : this.UIStatus.BLOCKED;
            } else {
                operation.accessHandlerResult = operation.status ? this.UIStatus.PASSED : this.UIStatus.BLOCKED;
                if (!operation.status && operation.insights == null)
                    operation.insights = operation.blockingAccessHandler + " is blocking access";
            }
        } else {
            if (!operation.containsACL)
                operation.aclResult = this.UIStatus.UNDEFINED;
            operation.accessHandlerResult = this.UIStatus.SKIPPED;
            if (operation.hasDataFiltration) {
                //if df log is present, the result should be passed in this case
                operation.datafiltrationResult = this.UIStatus.PASSED;
            } else {
                // if no df log, then df not available
                operation.datafiltrationResult = this.UIStatus.SKIPPED;
            }
        }

        if (operation.logType === "SecurityRulesInfo" && operation.containsACL) {
            operation.aclResult = operation.status ? this.UIStatus.PASSED : this.UIStatus.BLOCKED;
        }

    },

    parseResponse: function(response) {
        let result = JSON.parse(JSON.stringify(response));

        if (result.errorMessage != "") {
            return result;
        }

        var adminOverrideAT = gs.getProperty('glide.security.admin.override.accessterm');
        var securityDebug = result.securityDebug;
        var request = result.request;
        var operations = request.targetOperations;

        var _this = this;
        operations.forEach(function(opr) {
            var aclCount = 0,
                hasDF = false,
                blockAH = '';
            opr = opr.toLowerCase();
            var adminOverride = (adminOverrideAT === 'true' || request.targetResource != "RECORD" || !request.targetRecord) ? 'n/a' : '';
            var path = "record/" + request.targetName + (request.targetField ? "." + request.targetField : "") + "/" + opr;
            var operation = securityDebug[opr];
            var seq = 1;
            var securityDataFilterCount = 1;
            var markedForDeletion = [];
            operation.containsScriptedACL = false;
            operation.debugLogs.forEach(function(debugLog, index) {
                switch (debugLog.logType) {
                    case _this.LogType.DATA_FILTRATION:
                        debugLog.log_sequence = seq++;
                        debugLog.type = "Data Filtration";
                        debugLog.name = gs.getMessage("Data Filtration: {0}", debugLog.name);
                        debugLog.recordRef = debugLog.ref.split("=")[1];
                        debugLog.status = debugLog.status ? _this.UIStatus.PASSED : _this.UIStatus.BLOCKED;
                        hasDF = true;
                        break;
                    case _this.LogType.ACCESS_HANDLER:
                        if (debugLog.accessHandler !== "DataFiltrationAccessHandler") {
                            debugLog.log_sequence = seq++;
                            debugLog.type = "Access Handler";
                            debugLog.name = gs.getMessage("Access Handler: {0}", debugLog.name);
                            debugLog.appliesTo = debugLog.accessHandler;
                            debugLog.status = debugLog.result ? _this.UIStatus.PASSED : _this.UIStatus.BLOCKED;
                            if (!debugLog.result && !blockAH) {
                                blockAH = debugLog.accessHandler;
                            }
                        } else {
                            markedForDeletion.push(index);
                        }
                        break;
                    case _this.LogType.BUSINESS_RULE:
                        debugLog.log_sequence = seq++;
                        debugLog.type = "Business Rule";
                        debugLog.name = gs.getMessage("Business Rule: {0}", debugLog.name);
                        debugLog.recordRef = debugLog.sysId;
                        break;
                    case _this.LogType.SECURITY_RULE:
                        var acls = debugLog.acls;
                        aclCount = acls.length;
                        acls.forEach(function(acl) {
                            acl.log_sequence = seq++;
                            acl.hasScript = false;
                            _this._setACLDetail(acl, opr, request);
                            operation.containsScriptedACL ||= acl.hasScript;
                        });
                        break;
                    case _this.LogType.SECURITY_DATA_FILTER:
                        debugLog.log_sequence = seq++;
                        debugLog.type = "Security Data Filter";
                        debugLog.name = gs.getMessage("Security data filter_{0}", securityDataFilterCount);
                        debugLog.recordRef = debugLog.dataFilterResult.sysId;
                        debugLog.status = debugLog.applicable ? _this.UIStatus.APPLIED : _this.UIStatus.NOT_APPLIED;
                        securityDataFilterCount++;
                        break;
                }

                if (debugLog.path == path && !adminOverride) {
                    adminOverride = debugLog.isCumulativeOverride ? "yes" : "no";
                }
            });
            for (let index = markedForDeletion.length - 1; index >= 0; index--) {
                const element = markedForDeletion[index];
                operation.debugLogs.splice(element, 1);
            }
            operation.containsACL = aclCount > 0;
            operation.hasDataFiltration = hasDF;
            operation.blockingAccessHandler = blockAH;
            operation.adminOverrideApplied = adminOverride ? adminOverride : "n/a";
            _this._populateAccessInfo(opr, result);
            operation.status = _this._getUIResultString("" + operation.status);
        });
        return result;
    },

    getDebugLog: function(request, includeDetail) {
        var debugLogAPI = new sn_identity.IdentitySecurityApi();
        var response = JSON.parse(debugLogAPI.getDebugLog(request));
        return includeDetail ? this.parseResponse(response) : response;
    },

    getSimulatedResult: function(request, includeDetail) {
        var debugLogAPI = new sn_identity.IdentitySecurityApi();
        var response = debugLogAPI.simulateAccess(request);
        response = includeDetail ? this.parseResponse(response) : response;
        response.date = new GlideDateTime().getDisplayValue();
        return response;
    },
    // Debug log transformation layer ends.

    saveSimulatorSetting: function(payload) {
        var gr = new GlideRecord('sys_properties');
        gr.addQuery('name', 'sn_access_analyzer.glide.identity.access_simulator.take_action');
        gr.query();
        if (gr.next()) {
            gr.setValue('value', payload.takeAction);
            gr.update();
        }
    },

    isInheritedRole: (params) => {
        var gr = new GlideRecord("sys_user_has_role");
        gr.addQuery("user", params.userSysId);
        gr.addQuery("role", params.roleSysId);
        gr.addQuery("inherited", true);
        gr.setLimit(1);
        gr.query();
        return gr.next();
    },

    getAccessSimulatorChanges: function(payload) {
        const limit = Math.min(300, parseInt(gs.getProperty('sn_access_analyzer.glide.identity.access_simulator.preview_changes_limit')));
        if ((payload.rolesToAssign && !this.isRoleCountManageable(payload.rolesToAssign[0], 'sys_user_role_contains', 'role', limit)) ||
            (payload.groupsToAssign && !this.isRoleCountManageable(payload.groupsToAssign[0], 'sys_group_has_role', 'group', limit))) {
            return {
                errorCode: 'ROLE_COUNT_EXCEEDED'
            };
        }
        let res = new sn_identity.IdentitySecurityApi().getAccessSimulatorChanges(payload);
        res = JSON.parse(res);
        if (res.length > limit) {
            return {
                errorCode: 'ROLE_COUNT_EXCEEDED'
            };
        }
        res.forEach(node => delete node.accessEntity.containingGroups);
        return res;
    },

    getRoleMap: function(params) {
        const limit = Math.min(300, parseInt(gs.getProperty('sn_access_analyzer.glide.identity.compare_user_access.node_map_limit')));
        var api = new sn_identity.IdentityRoleApi();
        var resp = api.getRoles({
            userId: params.userId,
            targetRoles: params.targetRoles
        });
        var count = 0;
        resp = JSON.parse(resp || "[]");
        for (let role of resp) {
            count += 1 + role.containingGroups.length;
            if (count > limit) {
                return {
                    errorCode: 'ROLE_COUNT_EXCEEDED'
                };
            }
        }
        return resp;
    },

    isRoleCountManageable: function(id, table, column, limit) {
        var gr = new GlideAggregate(table);
        gr.addAggregate('count');
        gr.addQuery(column, id);
        gr.query();
        gr.next();
        return gr.getAggregate('count') <= limit;
    },

    muteFindings: function(findingSysIdList, muteReasonId) {
        //validate reasonId
        var reasonGr = new GlideRecord('scan_mute_rule_reason');
        if (!reasonGr.get(muteReasonId)) {
            return {
                error: gs.getMessage("Invalid mute_reason_id {0}}", muteReasonId)
            };
        }
        var hardeningUtil = new global.SecurityCenterHardeningUtil();
        var gr = new GlideRecord('sn_access_analyzer_access_finding');
        gr.addQuery('sys_id', findingSysIdList);
        gr.query();
        while (gr.next()) {
            var prevReason = gr.finding.scan_mute_rule?.mute_reason;
            hardeningUtil.muteFinding(gr.finding, muteReasonId);
            if (!prevReason || prevReason != reasonGr.mute_reason)
                gr.work_notes = "Mute reason updated to : " + reasonGr.mute_reason;
            gr.status = 'muted';
            gr.update();
        }
    },

    unmuteFindings: function(findingSysIdList) {
        var hardeningUtil = new global.SecurityCenterHardeningUtil();
        var gr = new GlideRecord('sn_access_analyzer_access_finding');
        gr.addQuery('sys_id', findingSysIdList);
        gr.query();
        while (gr.next()) {
            hardeningUtil.unmuteFinding(gr.finding);
            gr.status = 'open';
            gr.update();
        }
    },

    type: 'AccessAnalyzerUtil'
};
