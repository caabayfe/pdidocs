function include({imports}) {

    const { DM_POLICY_TYPE_IDS } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
    /**
     * 
     * @param validatorModel
     * @param selectedTabId
     * @param policyData
     * @returns Whether all fields are valid
     */
    const _validatePolicyForm = async (validatorModel, selectedTabId, policyData, helpers) => {
        // don't validate the review page
        if (selectedTabId === "review")
            return true;

        // Validate that all fields are valid
        let allFieldsValid = true;
        let assignmentType = '';
        const policyTypeId = policyData.general_info.cmdb_policy_type;
        let validatorFields = validatorModel[selectedTabId];
        const dataFields = policyData[selectedTabId];
        if (selectedTabId === "options") {
            validatorFields = validatorModel[selectedTabId][policyTypeId];

            // Additional validation for archive for days and retention time
            let checkRetentionTime = false;
            let checkDueInDays = false;
            if (policyTypeId === DM_POLICY_TYPE_IDS.LIFECYCLE.ARCHIVE) {
                checkRetentionTime = true;
            }
            else if (policyTypeId === DM_POLICY_TYPE_IDS.NON_LIFECYCLE.ATTESTATION || policyTypeId === DM_POLICY_TYPE_IDS.NON_LIFECYCLE.CERTIFICATION) {
                checkDueInDays = true;
            }

            if (checkRetentionTime) {
                // Check to make sure the value does not contain a decimal or negative
                if (_hasDecimalOrNegative(policyData.options.retention_time))
                    allFieldsValid = false;

                // Validate that the max number is not higher than is allowed
                let retentionTime = parseInt(policyData[selectedTabId].retention_time);
                let timeframeSelection = policyData[selectedTabId].retention_timeframe_selection;

                if (timeframeSelection === "days") {
                    if (retentionTime > 3650)
                        allFieldsValid = false;
                }
                else if (timeframeSelection === "months") {
                    if (retentionTime > 120)
                        allFieldsValid = false;
                }
                else if (timeframeSelection === "years") {
                    if (retentionTime > 10)
                        allFieldsValid = false;
                }
            }
            if (checkDueInDays) {
                // Check to make sure the value does not contain a decimal or negative
                if (_hasDecimalOrNegative(policyData.options.task_due_in_days))
                    allFieldsValid = false;

                // Validate that the max number is not higher than is allowed or zero
                let intDueDays = parseInt(policyData.options.task_due_in_days);
                if (intDueDays > 397 || intDueDays === 0)
                    allFieldsValid = false;

                // For attestation, only task_due_in_days is required, and the below validation causes the validator model to say invalid false
                // So do our own setting of invalid
                if (!allFieldsValid) {
                    validatorModel[selectedTabId]["task_due_in_days"] = {
                        "invalid": true,
                        "alertMessage": await _getAlertContent("task_due_in_days", helpers)
                    }
                    // Set the actual field to be invalid
                    validatorModel[selectedTabId][policyTypeId]["task_due_in_days"] = {
                        "invalid": true,
                        "alertMessage": await _getAlertContent("task_due_in_days", helpers)
                    }
                    return false;
                }
            }
        }
        else if (selectedTabId === "assignment") {
            assignmentType = policyData.assignment.task_assignment_type;
            if (!assignmentType) {
                validatorModel[selectedTabId]['task_assignment_type'] = {
                    "invalid": true,
                    "alertMessage": await _getAlertContent('task_assignment_type', helpers)
                };
                return false;
            } else {
                 validatorModel[selectedTabId]['task_assignment_type'] = {
                    "invalid": false,
                    "alertMessage": []
                };
            }
            let key = '';
            if (assignmentType === "specific_user") {
                key = 'user';
            }
            else if (assignmentType === "specific_user_group") {
                key = 'user_group';
            } else if(dataFields['task_management_field_path']) {
                key = 'task_management_field_path';
            }
            else if (assignmentType === "user_field") {
                key = 'task_management_user';
            }
            else if(assignmentType === "user_group_field") {
                key = 'task_management_group';
            }
            else {
                console.warn("Unknown assignment type: " + assignmentType);
                return false;
            }
            validatorFields = { [key] : { "invalid": false, parentKey: assignmentType }};

            if(assignmentType === "user_field" || assignmentType === "user_group_field") {
                validatorFields.empty_assignment_action = {"invalid": false};
                if(policyData.assignment.empty_assignment_action === "create_assigned_task") {
                    validatorFields.empty_assignment_value = {"invalid": false};
                }
            }
        } else if (selectedTabId === "schedule") {
            // don't validate lifecycle policies, they don't have a schedule
            if (!Object.values(DM_POLICY_TYPE_IDS.NON_LIFECYCLE).includes(policyTypeId))
                return true;
            // convert into an object for the validator iterator
            validatorFields = _getScheduleItemsByType(policyData.schedule.run_type || "")
                .reduce((acc, value) => ({ ...acc, [value]: {"invalid": false}}), {});
            //check for scheduled job runner information for non-lifecycle
            if (Object.values(DM_POLICY_TYPE_IDS.NON_LIFECYCLE).includes(policyTypeId)){
                validatorFields = { run_user: { "invalid": false } };
            }
        }
        
        let validatorFieldsArr = Object.keys(validatorFields);
        for (var i = 0; i < validatorFieldsArr.length; i++) {
            let validatorField = validatorFieldsArr[i];
            // Reset the validation for the field. Need to do this for the trickery needed for the options validation.
            validatorModel[selectedTabId][validatorField] = {
                "invalid": false
            }
            const currentVal = dataFields[validatorField]?.replace(/([​])+/g, "");

            if (!currentVal) {
                if (selectedTabId === "assignment") {
                    let key = validatorFields[validatorField].parentKey || validatorField;
                    validatorModel[selectedTabId][key] = {
                        "invalid": true,
                        "alertMessage" : await _getAlertContent(key, helpers)
                    }
                } else if (selectedTabId === "options") {
                    // Set the field we can bind to for options validation
                    validatorModel[selectedTabId][validatorField] = {
                        "invalid": true,
                        "alertMessage" : await _getAlertContent(validatorField, helpers)
                    }
                    // Set the actual field to be invalid
                    validatorModel[selectedTabId][policyTypeId][validatorField] = {
                        "invalid": true,
                         "alertMessage" : await _getAlertContent(validatorField, helpers)
                    }
                }
                else {
                    validatorModel[selectedTabId][validatorField] = {
                        "invalid": true,
                        "alertMessage" : await _getAlertContent(validatorField, helpers)
                    }
                }
                allFieldsValid = false;
            } else { //reset the alert messages
                if (selectedTabId === "assignment") {
                    validatorModel[selectedTabId][assignmentType] = {
                        "invalid": false,
                        "alertMessage" : []
                    }
                } else {
                    validatorModel[selectedTabId][validatorField] = {
                        "invalid": false,
                        "alertMessage" : []
                    }
                }
            }
         
        };

        return allFieldsValid;
    };

    const _getAlertContent = async (validatorField, helpers) => {
        var content = "";
        switch(validatorField) {
            case "user_group_field": 
                return [{"content" : await helpers.translate("User group field is required"), "status":"critical" }];
            case "specific_user": 
                return [{"content" : await helpers.translate("Specific user field is required"), "status":"critical" }];
            case "specific_user_group":
                return [{"content" : await helpers.translate("Specific user group field is required"), "status":"critical" }];
            case "user_field":
                return [{"content" : await helpers.translate("User field is required"), "status":"critical" }];
            case "task_assignment_type": 
                return [{"content":  await helpers.translate("Assignment type selection is required"), "status":"critical"}];
            case "cmdb_policy_type": 
                return [{"content":  await helpers.translate("Policy Type is required"), "status":"critical"}];
            case "policy_name": 
                return [{"content":  await helpers.translate("Policy name is required"), "status":"critical"}];
            case "subflow": 
                return [{"content":  await helpers.translate("Subflow is required"), "status":"critical"}];
            case "task_due_in_days":
                return [{"content":  await helpers.translate("Days to complete is required. Enter a valid number."), "status":"critical"}];
            case "run_user":
                return [{"content":  await helpers.translate("User for running scheduled job is required"), "status":"critical"}];
            case "empty_assignment_action":
                return [{"content":  await helpers.translate("Assignment action for empty fields is required"), "status":"critical"}];
            case "empty_assignment_value":
                return [{"content":  await helpers.translate("Assignment principal for empty fields is required"), "status":"critical"}];
        }
    };

    const _getScheduleItemsByType = (runType) => {
        switch (runType) {
            case "daily":
                return ["run_type", "run_time"];
            case "weekly":
                return ["run_type", "run_time", "run_dayofweek"];
            case "monthly":
                return ["run_type", "run_time", "run_dayofmonth"];
            case "periodically":
                return ["run_type", "run_period", "run_start"];
            case "once":
                return ["run_type", "run_start"];
            default:
                return ["run_type"];
        }
    };

    const _hasDecimalOrNegative = (checkValue) => {
        return checkValue.indexOf(".") > -1 || checkValue.indexOf("-") > -1;
    };

    return {
        validatePolicyForm: _validatePolicyForm
    };
}
