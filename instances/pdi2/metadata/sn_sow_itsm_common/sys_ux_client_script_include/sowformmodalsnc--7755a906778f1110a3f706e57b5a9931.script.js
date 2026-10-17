function include({
    imports
}) {
    class SOWFormModalSNC {

        static getModals() {
            const modals = {
                "incident_form_resolve": {
                    requiredFields: ["close_code", "parent_incident", "close_notes", "number"],
                    initializeFields: (fields) => {
                        this.setMandatory(fields, "close_code", true);
                        this.setMandatory(fields, "close_notes", true);
                        this.setVisible(fields, "close_code", true);
                        this.setVisible(fields, "close_notes", true);
                        this.setVisible(fields, "number", false);
                        if (fields["close_code"].value == "Duplicate") {
                            this.setVisible(fields, "parent_incident", true);
                            this.setMandatory(fields, "parent_incident", true);
                        } else {
                            this.setVisible(fields, "parent_incident", false);
                        }
                    },
                    processField: (fields, fieldName, value, displayValue, api) => {
                        if (fieldName == "parent_incident" && (fields.close_notes.value == "" || fields.close_notes.value == api.state.generatedResolutionNotes)) {
                            var message = fields.number.value + " is marked as a duplicate of " + displayValue;
                            this.setValue(fields, "close_notes", message);
                            api.setState('generatedResolutionNotes', message);
                        }
                        if (fieldName == "close_code") {
                            if (value == "Duplicate") {
                                this.setMandatory(fields, "parent_incident", true);
                                this.setVisible(fields, "parent_incident", true);
                            } else {
                                this.setMandatory(fields, "parent_incident", false);
                                this.setVisible(fields, "parent_incident", false);
                                if (fields.close_notes.value == api.state.generatedResolutionNotes) {
                                    this.setValue(fields, "parent_incident", "");
                                    this.setValue(fields, "close_notes", "");
                                    api.setState('generatedResolutionNotes', message);
                                }
                            }
                        }
                    }
                },
                "assign_modal": {
                    processField: (fields, fieldName, value, displayValue) => {
                        if (fieldName == "assignment_group") {
                            this.setValue(fields, "assigned_to", "", "");
                        }
                    }
                }
            };
            return modals;
        }

        static setMandatory(fields, fieldName, value) {
            if (fields[fieldName]) {
                fields[fieldName]['mandatory'] = value;
            }
        };

        static setValue(fields, fieldName, value, displayValue) {
            if (fields[fieldName]) {
                fields[fieldName]['value'] = value;
                fields[fieldName]['displayValue'] = displayValue ? displayValue : value;
            }
        };

        static setVisible(fields, fieldName, value) {
            if (fields[fieldName]) {
                fields[fieldName]['visible'] = value;
            }
        };

        static getProcessFields(modalPath) {
            var modals = this.getModals();
            if (modals[modalPath] && modals[modalPath].processField) {
                return modals[modalPath].processField;
            }
            return;
        };

        static getInitializeFields(modalPath) {
            var modals = this.getModals();
            if (modals[modalPath] && modals[modalPath].processField) {
                return modals[modalPath].initializeFields;
            }
            return;
        };

        static getRequiredFields(modalPath) {
            var modals = this.getModals();
            return modals[modalPath].requiredFields;
        };

        static getFieldMap(inputFields, requiredFields) {
            var fields = {};

            for (var i = 0; i < requiredFields.length; i++) {
                if (inputFields[requiredFields[i]])
                    fields[requiredFields[i]] = this.proessField(inputFields[requiredFields[i]]);
            }
            return fields;
        };

        static proessField(field) {
            //Remove field decorators
            field.declarativeUiActions = [];
            return field;
        };

        static getSectionMap(requiredFields, modalPath) {
            var section = [{
                rows: [
                    [{
                        fields: []
                    }]
                ],
                id: 0
            }];

            if (!requiredFields.length) {
                requiredFields = this.getRequiredFields(modalPath);
                if (requiredFields)
                    return fields;
            }

            var fields = [];
            for (var i = 0; i < requiredFields.length; i++) {
                fields.push(requiredFields[i]);
    }
            section[0]["rows"][0][0]["fields"] = fields;
            return section;
        };
    }
    return SOWFormModalSNC;
}
