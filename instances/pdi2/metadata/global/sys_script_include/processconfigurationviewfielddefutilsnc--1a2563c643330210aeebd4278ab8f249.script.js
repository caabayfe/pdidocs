var ProcessConfigurationViewFieldDefUtilSNC = Class.create();
ProcessConfigurationViewFieldDefUtilSNC.prototype = {
    initialize: function() {
        this.processConfigUtil = new global.ProminProcessConfigUtil();
    },
    _checkExistence: function(processId, field, fieldId, fieldLabel) {
        var isAlreadyExists = this.processConfigUtil.isActivityFieldDuplicate(processId, field, fieldId);
        if (isAlreadyExists) {
            return {
                success: false,
                message: gs.getMessage('Field {0} is already saved.', fieldLabel),
            };
        }
        return isAlreadyExists;
    },
    _isEditingSameField: function(fieldId, field) {
        var isEditingSameField = false;
        var processGr = new GlideRecordSecure("promin_view_field_config");
        processGr.get(fieldId);
        processGr.query();
        while (processGr.next()) {
            if (processGr.field == field) {
                isEditingSameField = true;
            }
        }
        return isEditingSameField;
    },
    createProcessPerspectiveField: function(processId, newFieldPayload) {
        try {
            var grPerspectiveViewFieldConfig = new GlideRecordSecure('promin_view_field_config');
            grPerspectiveViewFieldConfig.initialize();
            grPerspectiveViewFieldConfig.setValue('process_def', processId);
            grPerspectiveViewFieldConfig.setValue('field', newFieldPayload.fieldName);
            grPerspectiveViewFieldConfig.setValue('grouped', newFieldPayload.grouped);
            grPerspectiveViewFieldConfig.setValue('view', newFieldPayload.perspectiveType);
            grPerspectiveViewFieldConfig.setValue('include_in_new_project', newFieldPayload.includeInNewProject);
            const fieldId = grPerspectiveViewFieldConfig.insert();
            if (gs.nil(fieldId)) {
                return {
                    success: false,
                    message: gs.getMessage('Process perspective creation failed.'),
                };
            }
            newFieldPayload.id = fieldId;
            return {
                success: true,
                message: gs.getMessage('Process perspective created successfully.'),
                field: newFieldPayload
            };
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage('Process perspective creation failed.'),
            };
        }
    },
    updateProcessPerspectiveFieldRecord: function(fieldPayload) {
        try {
            var grPerspectiveViewFieldConfig = new GlideRecordSecure('promin_view_field_config');
            if (grPerspectiveViewFieldConfig.get(fieldPayload.fieldId)) {
                grPerspectiveViewFieldConfig.setValue('include_in_new_project', fieldPayload.includeInNewProject);
                var id = grPerspectiveViewFieldConfig.update();
                if (gs.nil(id)) {
                    return {
                        success: false,
                        message: gs.getMessage('Process perspective updation failed.'),
                    };
                }
				fieldPayload.id = fieldPayload.fieldId;
                return {
                    success: true,
                    message: gs.getMessage('Process perspective updated successfully.'),
                    field: fieldPayload
                };
            }
            return {
                success: false,
                message: gs.getMessage('Process perspective updation failed. Record not found.'),
            };
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage('Process perspective updation failed.'),
            };
        }
    },
    upsertPerspectiveFied: function(processId, payload) {
        if (payload.fieldId) {
            // update
            return this.updateProcessPerspectiveField(processId, payload);
        }
        // insert
        const newInsertion = this._checkExistence(processId, payload.fieldName, payload.fieldId, payload.fieldLabel);
        if (!newInsertion) {
            return this.createProcessPerspectiveField(processId, payload);
        }
        return newInsertion;
    },
    deleteProcessPerspectiveField: function(id) {
        try {
            var processGr = new GlideRecordSecure("promin_view_field_config");
            processGr.get(id);
            processGr.query();
            if (processGr.next()) {
                var result = processGr.deleteRecord();
                if (!result) {
                    return {
                        success: false,
                        message: gs.getMessage('Process perspective field deletion failed.'),
                    };
                }
                return {
                    success: true,
                    message: gs.getMessage('Process perspective field deleted successfully.'),
                };
            }
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage('Process perspective field deletion failed.'),
            };
        }
    },
    updateProcessPerspectiveField: function(processId, payload) {
        try {
            var isEditingSameField = this._isEditingSameField(payload.fieldId, payload.fieldName);
            if (isEditingSameField) {
                // Update the perspective
                return this.updateProcessPerspectiveFieldRecord(payload);
            }
            var isExistsResponse = !isEditingSameField ? this._checkExistence(processId, payload.fieldName, payload.fieldId, payload.fieldLabel) : false;
            if (!isExistsResponse) {
                var result = this.deleteProcessPerspectiveField(payload.fieldId);
                if (result.success) {
                    var response = this.createProcessPerspectiveField(processId, payload);
                    if (response.success) {
                        return {
                            success: true,
                            message: gs.getMessage('Process prospective field updated successfully.'),
                            field: response.field,
                        };
                    }
                }
                return {
                    success: false,
                    message: gs.getMessage('Process perspective field updation failed.'),
                };
            }
            return isExistsResponse;

        } catch (err) {
            return {
                success: false,
                message: gs.getMessage('Process perspective field updation failed.'),
            };
        }
    },
    type: 'ProcessConfigurationViewFieldDefUtilSNC'
};
