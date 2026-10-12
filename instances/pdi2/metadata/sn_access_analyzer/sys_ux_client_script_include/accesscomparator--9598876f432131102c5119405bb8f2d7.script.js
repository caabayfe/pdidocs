function include({ imports }, api, helpers) {


    const { EvalStatus, isEmpty } = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);

    class AccessComparator {

        constructor(baseUserRef, modelUserRef, params) {
            this.params = Object.assign({
                baseUserRef: baseUserRef,
                modelUserRef: modelUserRef,
                defaultStatus: EvalStatus.SKIPPED.value
            }, params);
        }

        //------------------------------------------------------------//

        /**
         * attributes in requestMapper
         * rowData(id,name), userData(script,status, etc.,)
         */
        requestRowMapper(rowData) {
            return rowData;
        }

        //------------------------------------------------------------//

        getComparisonResult(dataList) {
            var map = {};
            var index = 0;
            dataList.forEach(row => {
                var requestData = this.requestRowMapper(row, index);
                if (requestData == null) return;
                if (!map[requestData.rowData.id]) {
                    map[requestData.rowData.id] = {
                        index: index++,
                        rowData: requestData.rowData,
                        baseUser: null,
                        modelUser: null
                    }
                }
                map[requestData.rowData.id][this.params.baseUserRef == requestData.userData.id ? "baseUser" : "modelUser"] = requestData.userData;
            });
            return Object.keys(map).map(id => this.resultRowMapper(map[id]));
        }

        //------------------------------------------------------------//


        resultRowMapper(row) {
            var val = row.rowData || {};
            val.baseUser = row.baseUser ? row.baseUser.value : null;
            val.modelUser = row.modelUser ? row.modelUser.value : null;
            return {
                index: row.index,
                name: {
                    label: row.rowData.name,
                    value: row.rowData.name,
                    metadata: val
                },
                baseUser: this.getStatus(row.baseUser),
                modelUser: this.getStatus(row.modelUser)
            };
        }

        //------------------------------------------------------------//

        getStatus(user) {
            user = user || {};
            var status = (isEmpty(user.status) ? this.params.defaultStatus : user.status).toUpperCase();
            if ((status == "PASSED" || status == "BLOCKED") && !isEmpty(user.script)) {
                return status + "_MAYBE";
            }
            return status;
        }
    }

    //--------------------------------------------------------------------------------//

    class GroupComparator extends AccessComparator {

        constructor(baseUserId, modelUserId, params) {
            super(baseUserId, modelUserId, params);
            this.params.defaultStatus = EvalStatus.GROUP_NOT_GRANTED.value
        }

        requestRowMapper(row) {
            return {
                rowData: {
                    id: row.group.value,
                    name: row.group.displayValue
                },
                userData: {
                    id: row.user.value,
                    status: EvalStatus.HAS_GROUP.value
                }
            }
        }
    }

    //--------------------------------------------------------------------------------//

    class RoleComparator extends AccessComparator {

        constructor(baseUserId, modelUserId, params) {
            super(baseUserId, modelUserId, params);
            this.params.defaultStatus = EvalStatus.ROLE_NOT_GRANTED.value
        }


        requestRowMapper(row) {
            return {
                rowData: {
                    id: row.role.value,
                    name: row.role.displayValue
                },
                userData: {
                    id: row.user.value,
                    status: EvalStatus.HAS_ROLE.value
                }
            }
        }
    }

    //--------------------------------------------------------------------------------//

    class UserComparator extends AccessComparator {

        setFieldList(fieldList) {
            this.fieldList = fieldList;
        }

        getComparisonResult(list) {
            var fieldMap = new Map([
                ["user_name", null],
                ["email", null],
                ["active", null],
                ["sys_created_on", null],
                ["failed_attempts", null],
                ["last_login", null],
                ["internal_integration_user", null],
                ["password_needs_reset", null],
                ["sys_created_by", null],
                ["sys_updated_by", null]
            ]);
            
            Object.keys(this.fieldList).forEach(id => fieldMap.set(id, this.fieldList[id]));
            var result = [];
            list.forEach(user => {
                fieldMap.forEach((fieldLabel, fieldName) => {
                    if (fieldLabel == null) return;
                    result.push({
                        rowData: {
                            id: fieldName,
                            label: fieldLabel,
                        },
                        userData: {
                            id: user._row_data.uniqueValue,
                            value: user[fieldName] ? user[fieldName].displayValue : ""
                        }
                    });
                });
            });
            return super.getComparisonResult(result);
        }

        resultRowMapper(row) {
            return {
                index: row.index,
                name: {
                    label: row.rowData.label,
                    value: row.rowData.label
                },
                baseUser: row.baseUser ? row.baseUser.value : "",
                modelUser: row.modelUser ? row.modelUser.value : ""
            };
        }

    }

    //--------------------------------------------------------------------------------//

    class OperationComparator extends AccessComparator {

        requestRowMapper(row) {
            return {
                rowData: {
                    id: row.operation.value,
                    name: row.operation.value,
                },
                userData: {
                    id: row.access_analyzer_request.value,
                    status: row.overall_access.value,
                    script: row.script_execution.value,
                    value: {
                        resultId: row._row_data.uniqueValue
                    }
                }
            }
        }
    }

    //--------------------------------------------------------------------------------//

    class DebugLogComparator extends AccessComparator {

        sortLogs(result, prefOrder){
            result.sort(function (a, b) {
                if (a.log_sequence.value != b.log_sequence.value) {
                    return a.log_sequence.value - b.log_sequence.value;
                }
                return prefOrder.indexOf(a.type.value) - prefOrder.indexOf(b.type.value);
            });
        }
        getComparisonResult(result) {
            var prefOrder = ["Business Rule", "Security Data Filter", "Access Handler", "Data Filtration", "ACL"];
            this.sortLogs(result, prefOrder);
            return super.getComparisonResult(result);
        }
        requestRowMapper(row) {
            var isAH = row.type.value == "Access Handler";
            return {
                rowData: {
                    id: isAH ? row.applies_to.value : row.record_ref.value,
                    name: isAH ? 'Access handler' : row.record_ref.displayValue,
                    decisionType: row.decision_type.displayValue,
                    appliesToCondition: row.applies_to_condition_result.displayValue,
                    empty: row.empty.displayValue,
                    appliesTo: row.applies_to.value,
                    type: row.type.value
                },
                userData: {
                    id: row.access_result.value,
                    status: row.status.value,
                    script: row.script_execution.value,
                    value: {
                        sysId: row._row_data.uniqueValue,
                    }
                }
            };
        }

        resultRowMapper(row) {
            var result = super.resultRowMapper(row);
            result.decisionType = row.rowData.decisionType;
            result.appliesToCondition = row.rowData.appliesToCondition;
            result.empty = row.rowData.empty;
            result.appliesTo = row.rowData.appliesTo;
            result.index++;
            if (row.rowData.type == "Business Rule") {
                result.baseUser = "";
                result.modelUser = "";
            }
            return result;
        }
    }

    //--------------------------------------------------------------------------------//

    class ACLDetailComparator extends AccessComparator {

        getComparisonResult(result) { 
            return super.getComparisonResult(this.getModifiedResult(result));
        }

        getModifiedResult(result){
            var list = [];
            result.forEach(row => {
                this.add(list, row, "Roles", "roles_result")
                this.add(list, row, "Security Attribute", "security_attribute");
                this.add(list, row, "Condition", "condition_result");
                this.add(list, row, "Controlled by References", "controlled_by_references_result");
                this.add(list, row, "Script", "script_result");
            });
            return list;
        }

        add(list, row, label, name) {
            list.push({
                rowData: {
                    id: name,
                    name: label,
                },
                userData: {
                    id: row._row_data.uniqueValue,
                    status: row[name] ? row[name].value : EvalStatus.SKIPPED.value,
                    script: label == "Script" ? row.script_execution.value : null
                }
            });
        }

        resultRowMapper(row) {
            var result = super.resultRowMapper(row);
            result.name.value = row.rowData.name;
            return result;
        }

    }


    //--------------------------------------------------------------------------------//

    class SimulatedResultsAllOperationComparator extends AccessComparator {

        requestRowMapper(row) {
            return {
                rowData: {
                    id: row.name, //read,write,..
                    name: row.name,
                },
                userData: {
                    id: row.category, //present_status or simualted_status
                    status: row.status,
                    script: row.containsScriptedACL ? 'ACL' : null
                }
            }
        }
    }

    //--------------------------------------------------------------------------------//

    class SimulatedResultsDebugLogComparator extends DebugLogComparator {

        sortLogs(result, prefOrder) {
            result.sort(function (a, b) {
                if (a.log_sequence != b.log_sequence) {
                    return a.log_sequence - b.log_sequence;
                }
                return prefOrder.indexOf(a.type) - prefOrder.indexOf(b.type);
            });
        }

        requestRowMapper(row) {
            var isAH = row.type == "Access Handler";
            var isACL = row.type == "ACL";
            return {
                rowData: {
                    id: isAH ? row.appliesTo : row.sysId,
                    name: isAH ? 'Access handler' : row.name,
                    decisionType: row.decisionType || '',
                    appliesToCondition: isACL ? row.appliesToConditionResult : '',
                    empty: isACL ? row.empty : '',
                    appliesTo: row.appliesTo,
                    type: row.type
                },
                userData: {
                    id: row.category, //present_status or simualted_status
                    status: row.status,
                    script: row.hasScript ? 'Script' : null,
                    value: {
                        acl: row,
                    }
                }
            };
        }
    }

    //--------------------------------------------------------------------------------//

    class SimulatedResultsACLDetailComparator extends ACLDetailComparator {
        getModifiedResult(result) {
            var list = [];
            result.forEach(row => {
                this.add(list, row, "Roles", "rolesResult")
                this.add(list, row, "Security Attribute", "securityAttributeResult");
                this.add(list, row, "Condition", "conditionResult");
                this.add(list, row, "Controlled by References", "controlledByReferencesResult");
                this.add(list, row, "Script", "scriptResult");
            });
            return list;
        }

        add(list, row, label, name) {
            list.push({
                rowData: {
                    id: name,
                    name: label,
                },
                userData: {
                    id: row.category,
                    status: row[name] ? row[name] : EvalStatus.SKIPPED.value,
                    script: label == "Script" && row.hasScript ? 'Script' : null
                }
            });
        }

    }

    //--------------------------------------------------------------------------------//

    return {
        getComparator: function (type, baseUserRef, modelUserRef) {
            switch (type) {
                case "user":
                    return new UserComparator(baseUserRef, modelUserRef)
                case "role":
                    return new RoleComparator(baseUserRef, modelUserRef);
                case "group":
                    return new GroupComparator(baseUserRef, modelUserRef);
                case "operation":
                    return new OperationComparator(baseUserRef, modelUserRef);
                case "debuglog":
                    return new DebugLogComparator(baseUserRef, modelUserRef);
                case "acl":
                    return new ACLDetailComparator(baseUserRef, modelUserRef);
                case "simulated_results_all_operation":
                    return new SimulatedResultsAllOperationComparator(baseUserRef, modelUserRef);
                case "simulated_results_debug_logs":
                    return new SimulatedResultsDebugLogComparator(baseUserRef, modelUserRef);
                case "simulated_results_acl_detail":
                    return new SimulatedResultsACLDetailComparator(baseUserRef, modelUserRef);
            }
        }
    }

}
