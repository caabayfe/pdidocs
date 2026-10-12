function include({
    imports
}) {

    class SowRemediateServerPlaybookConfigSNC {
        static getFieldConfig(table, view) {
            if (!table || !view)
                return;
            const fieldConfig = {
                "change_request": {
                    "create": {
                        "cmdb_ci": {
                            readonly: true,
                            mandatory: true,
                            visible: true
                        },
                        "assignment_group": {
                            readonly: false,
                            mandatory: true,
                            visible: true
                        },
                        "assigned_to": {
                            readonly: false,
                            mandatory: true,
                            visible: true
                        },
                        "short_description": {
                            readonly: false,
                            mandatory: true,
                            visible: true
                        },
                    },
                    "schedule": {
                        "start_date": {
                            readonly: false,
                            mandatory: true,
                            visible: true
                        },
                        "end_date": {
                            readonly: false,
                            mandatory: true,
                            visible: true
                        },
                    }
                }
            };
            return fieldConfig[table][view];
        }
        static getTargetRecordFields(table) {
            const targetFields = {
                "change_request": "number,cmdb_ci,assignment_group,assigned_to,short_description"
            }
            return targetFields[table];
        }
        static getConflictCheckTimeout() {
            return 3000;
        }
        static getFormFields(table, view, fields) {
            var fieldConfig = this.getFieldConfig(table, view);
            var fieldValueMap = fields;
            for (var field in fieldValueMap) {
                if (fieldConfig[field]) {
                    for (var config in fieldConfig[field]) {
                        fieldValueMap[field][config] = fieldConfig[field][config];
                    }
                } else {
                    fieldValueMap[field].visible = false;
                }
            }
            return fieldValueMap;
        }
    }
    return SowRemediateServerPlaybookConfigSNC;
}
