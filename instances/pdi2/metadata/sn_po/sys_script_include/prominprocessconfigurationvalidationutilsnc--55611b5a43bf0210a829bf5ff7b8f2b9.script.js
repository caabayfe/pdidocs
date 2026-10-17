var ProminProcessConfigurationValidationUtilSNC = Class.create();
ProminProcessConfigurationValidationUtilSNC.prototype = {
    initialize: function() {},
    validateProcessConfig: function(grProcessConfig) {
        const errorMessages = [];
        var processConfigUtil = new global.ProminProcessConfigUtil();
        try {
            if (grProcessConfig.work_note_transition_time_range) {
                var timeRange = grProcessConfig.work_note_transition_time_range;
                if (timeRange < 0 || timeRange > 300) {
                    errorMessages.push(gs.getMessage("The Work Notes Time range value cannot be'{0}'. The acceptable time range is between 0 to 300 seconds.", timeRange));
                }
            }
            if (!gs.nil(grProcessConfig.work_note_min_length) && !gs.nil(grProcessConfig.work_note_max_length)) {
                var minLength = grProcessConfig.work_note_min_length;
                var maxLength = grProcessConfig.work_note_max_length;
                if (minLength < 5) {
                    errorMessages.push(gs.getMessage("Minimum work note length cannot be less than 5"));
                }
                if (minLength > maxLength) {
                    errorMessages.push(gs.getMessage("Maximum work note length should be more than Minimum work note length"));
                }
            }
            if (grProcessConfig.work_note_field_name) {
                var workNotesFields = grProcessConfig.work_note_field_name;
                if (!processConfigUtil.isFieldCountValid(workNotesFields, 3)) {
                    errorMessages.push(gs.getMessage("Max 3 Journal input fields are allowed for Work notes summarization"));
                }
            }
            if (grProcessConfig.classification_fields) {
                var classificationFields = grProcessConfig.classification_fields;
                if (!processConfigUtil.isFieldCountValid(classificationFields, 10)) {
                    errorMessages.push(gs.getMessage("Max 10 fields representing classification of records are allowed"));
                }

                const fields = classificationFields.split(',');
                var limit = gs.getProperty("promin.limit.breakdown_dot_walk", 3);
                for (var index = 0; index < fields.length; index++) {
                    if (!processConfigUtil.isDotWalkLevelValid(fields[index], limit)) {
                        errorMessages.push(gs.getMessage("Max {0} levels of dot walk is allowed for classification fields", [limit]));
                        break;
                    }
                }
            }
            if (!gs.nil(grProcessConfig.touch_point_fields)) {
                var MAX_TOUCH_POINT_FIELDS = 5;
                if (!processConfigUtil.isFieldCountValid(grProcessConfig.touch_point_fields, MAX_TOUCH_POINT_FIELDS)) {
                    errorMessages.push(gs.getMessage("Max {0} fields can be selected", [MAX_TOUCH_POINT_FIELDS]));
                }
            }
            if (!gs.nil(grProcessConfig.touch_point_time_range)) {
                if (grProcessConfig.touch_point_time_range < 0) {
                    errorMessages.push(gs.getMessage("Time interval can't be less than 0"));
                }
            }
            if (errorMessages.length > 0) {
                return {
                    success: false,
                    errorMessages: errorMessages
                };
            } else {
                return {
                    success: true,
                    errorMessages: []
                };
            }

        } catch (error) {
            return {
                success: false,
                errorMessages: [error.message],
            };
        }
    },
    type: 'ProminProcessConfigurationValidationUtilSNC'
};
