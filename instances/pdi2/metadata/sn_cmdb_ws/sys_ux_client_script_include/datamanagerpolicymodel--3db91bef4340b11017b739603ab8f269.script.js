function include({ imports }) {
    const { NowDateTime } = imports['sn_uxf.core_libraries']();

    /**
     * 
     * @returns Policy model
     */
    const _getPolicyModel = (userSession) => {
        // format the date
        const d = new Date();
        let month = (d.getMonth() + 1) + "";
        let day = d.getDate() + "";
        const year = d.getFullYear() + "";

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        const userDateFormat = userSession.dateFormat.toUpperCase() || "YYYY-MM-DD";
        const userTimeFormat = userSession.timeFormat || "HH:mm:ss";
        const userFormat = userDateFormat + " " + userTimeFormat;
        const dateFormat = [year, month, day].join('-');
        const dateTime = dateFormat + " 00:00:00";
        const formatted = new NowDateTime(dateTime).format(userFormat);
        const formattedTime = new NowDateTime(dateTime).format(userTimeFormat);

        return {
            "assignment": {
                "task_assignment_type": "",
                "task_management_group": "",
                "user": "",
                "user_group": "",
                "task_management_user": "",
                "task_management_field_path": "",
                "empty_assignment_action":"",
                "empty_assignment_value":""
            },
            "data_filter": {
                "encoded_query": "",
                "enforced_condition": "",
                "list_filter": "",
                "table": "cmdb_ci",
                "table_label": ""
            },
            "general_info": {
                "cmdb_policy_type": "",
                "description": "",
                "policy_name": "",
                "work_notes": ""
            },
            "options": {
                "archive_for_days": "1",
                "certification_fields": "",
                "display_fields": "",
                "allow_empty_fields": true,
                "allow_field_updates": true,
                "instructions": "",
                "needs_review": "",
                "retention_time": "1",
                "retention_timeframe_selection": "days",
                "subflow": "",
                "task_due_in_days": "1"
            },
            "schedule": {
                "run_dayofmonth": "1",
                "run_dayofweek": "1",
                "run_period": "1",
                "run_start": formatted,
                "run_time": formattedTime,
                "run_type": "daily",
                "run_user": ""
            },
            "status": "",
            "policySysId": ""
        }
    }

    /**
     * 
     * @param policyTypeSysId 
     * @returns required fields for a given policy type
     */
    const _getPolicyFieldValidatorModel = (policyTypeSysId) => {
        return {
            "general_info": {
                "policy_name": {
                    "invalid": false,
                    "alertMessage" : []
                },
                "cmdb_policy_type": {
                    "invalid": false,
                    "alertMessage" : []
                }
            },
            "data_filter": {
                "table": {
                    "invalid": false
                }
            },
            "assignment": {
                "task_assignment_type": {
                    "invalid": false,
                    "alertMessage" : []
                },
                "user_group_field": {
                    "invalid": false,
                    "alertMessage" : []
                },
                "specific_user": {
                    "invalid": false,
                    "alertMessage" : []
                },
                "user_field": {
                    "invalid": false,
                    "alertMessage" : []
                },
                "specific_user_group": {
                    "invalid": false,
                    "alertMessage" : []
                },
                "empty_assignment_action": {
                    "invalid": false,
                    "alertMessage" : []
                },
                "empty_assignment_value": {
                    "invalid": false,
                    "alertMessage" : []
                },
            }, "options": {
                "b82b20d00731201017b703767cd300e1": { // Archive
                    "subflow": {
                        "invalid": false,
                        "alertMessage" : []
                    }
                },
                "7b80ed7753823010ee0dddeeff7b1223": { // Attestation
                    "task_due_in_days": {
                        "invalid": false,
                        "alertMessage" : []
                    }
                },
                "fe2a16b3436031106d8a8ef0dab8f2ff": { // Certification
                    "task_due_in_days": {
                        "invalid": false,
                        "alertMessage" : []
                    },
                    "display_fields": {
                        invalid: false,
                    },
                    "certification_fields": {
                        invalid: false,
                    }
                },
                "562bec900731201017b703767cd300e7": { // Delete
                    "subflow": {
                        "invalid": false,
                        "alertMessage" : []
                    }
                },
                "c3059c79ff920110456d766cf43bf1c6": { // Delete CMDB Related Entry
                    "subflow": {
                        "invalid": false,
                        "alertMessage" : []
                    }
                },
                "66306fcb7352201026f6aa114df6a77c": { // Retire
                    "subflow": {
                        "invalid": false,
                        "alertMessage" : []
                    }
                }
            }, "schedule": {
                "run_type": {
                    "invalid": false
                },
                "run_time": {
                    "invalid": false
                },
                "run_dayofweek": {
                    "invalid": false
                },
                "run_dayofmonth": {
                    "invalid": false
                },
                "run_period": {
                    "invalid": false
                },
                "run_start": {
                    "invalid": false
                },
                "run_user": {
                    "invalid": false
                }
            }
        }
    }

    /**
     * 
     * @param policyTypeSysId 
     * @returns list of policy options for the options view
     */
    const _getPolicyOptionsByType = (policyTypeSysId) => {
        return {
            "b82b20d00731201017b703767cd300e1": ["subflow", "needs_review", "archive_for_days"], // Archive
            "7b80ed7753823010ee0dddeeff7b1223": ["task_due_in_days"], // Attestation
            "fe2a16b3436031106d8a8ef0dab8f2ff": ["display_fields", "certification_fields",  "allow_field_updates", "allow_empty_fields", "task_due_in_days", "instructions"], // Certification
            "562bec900731201017b703767cd300e7": ["subflow", "needs_review"], // Delete
            "c3059c79ff920110456d766cf43bf1c6": ["subflow", "needs_review"], // Delete CMDB Related Entry
            "66306fcb7352201026f6aa114df6a77c": ["subflow", "needs_review"] // Retire
        }
    }

    const _getScheduleItemsByType = (runType) => {
        switch (runType) {
            case "daily":
                return ["run_time"];
            case "weekly":
                return ["run_time", "run_dayofweek"];
            case "monthly":
                return ["run_time", "run_dayofmonth"];
            case "periodically":
                return ["run_period", "run_start"];
            case "once":
                return ["run_start"];
        }
    }

    return {
        getPolicyModel: _getPolicyModel,
        getPolicyFieldValidatorModel: _getPolicyFieldValidatorModel,
        getPolicyOptionsByType: _getPolicyOptionsByType,
        getScheduleItemsByType: _getScheduleItemsByType
    }
}
