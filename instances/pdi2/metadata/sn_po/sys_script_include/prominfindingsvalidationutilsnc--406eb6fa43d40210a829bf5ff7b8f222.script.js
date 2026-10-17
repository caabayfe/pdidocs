var ProminFindingsValidationUtilSNC = Class.create();
ProminFindingsValidationUtilSNC.prototype = {
    initialize: function() {},

    //Field - Type - Process Config - Project Uniqueness
    _validateUniqueness: function(grfindingDef, operation) {
        var grAutomatedFindingDef = new GlideRecord("promin_automated_finding");
        if (!gs.nil(grfindingDef.project)) {
            grAutomatedFindingDef.addQuery("project", grfindingDef.project);
        } else {
            grAutomatedFindingDef.addQuery("process_def", grfindingDef.process_def);
        }

        grAutomatedFindingDef.addQuery("field", grfindingDef.field);
        grAutomatedFindingDef.addQuery("type", grfindingDef.type);
        if (operation === 'update') {
            grAutomatedFindingDef.addQuery("sys_id", "!=", grfindingDef.getUniqueValue());
        }
        grAutomatedFindingDef.setLimit(1);
        grAutomatedFindingDef.query();
        if (grAutomatedFindingDef.next()) {
            var findingId = grAutomatedFindingDef.getUniqueValue();
            throw ({
                message: gs.getMessage("Duplicate Record::{0}", grAutomatedFindingDef.getUniqueValue()),
                status: "DUPLICATE_RECORD",
                findingId: findingId,
            })
        }
    },

    _validateDotWalkLevels: function(grfindingDef) {
        var field = grfindingDef.field;
        if (field.contains(".")) {
            var limit = gs.getProperty("promin.limit.max_activity_dot_walk_levels", 3);
            var fields = field.split(".");
            var levels = fields.length;
            if (levels > parseInt(limit)) {
                throw ({
                    message: gs.getMessage("The limit for dot walking in field is {0} levels e.g. CI.BusinessService.assignment group", limit),
                    status: "ERROR"
                });
            }
        }
    },
	
	//Restrict no of findings for project
    _validateNoOfFindingsForProject: function(grfindingDef) {
        var grAutomatedFindingDef = new GlideRecord("promin_automated_finding");
        if (grfindingDef.project != null) {
            grAutomatedFindingDef.addQuery("project", grfindingDef.project);
        }

        grAutomatedFindingDef.query();
        var limit = gs.getProperty("promin.limit.automated_finding", 15);
        if (grAutomatedFindingDef.getRowCount() >= limit) {
            throw ({
                message: gs.getMessage("Maximum ({0}) Automated finding definitions are allowed for a project",
                    limit),
                status: "ERROR"
            })
        }
    },

    //validate field
    _validateField: function(grfindingDef, operation) {
        var allowedFields = new global.ProminAllowedColumnList().process(grfindingDef.table, "promin_automated_finding", '');
        var allowedFieldIndex = allowedFields.findIndex((el) => el == grfindingDef.field);
        if (allowedFieldIndex < 0) {
            var internalType = new global.ProminUtils().getInternalTypeOfSelectedField(grfindingDef.table, grfindingDef.field);
            if (internalType == 'string') {
                throw ({
                    message: gs.getMessage("Textual or string fields are not allowed. Please select another field as an activity definition."),
                    status: "ERROR"
                })
            } else if (internalType == 'integer') {
                throw ({
                    message: gs.getMessage("Numbers or Integer fields are not allowed. Please select another field as an activity definition."),
                    status: "ERROR"
                })
            }
        }
    },

    //Field validation against AD
    validateFindingAD: function(grfindingDef, operation) {
        var grEntity = new GlideRecord("promin_project_entity");
        grEntity.addQuery("project", grfindingDef.project);
        grEntity.addNullQuery("parent_entity");
        grEntity.query();
        if (grEntity.next()) {
            var grActivity = new GlideRecord("promin_activity_def");
            grActivity.addQuery("entity", grEntity.getUniqueValue());
            grActivity.addQuery("field", grfindingDef.field);
            grActivity.query();
            if (grActivity.next()) {
                if (grActivity.getValue("type") != "DEFAULT") {
                    throw {
                        message: gs.getMessage('Automated findings can only be configured on activities of type "All field values (Default)". "{0}" is an activity of type {1} in this project.', [grfindingDef.field, grActivity.getDisplayValue("type")]),
                        status: "ERROR"
                    }

                } else if (grActivity.getValue("track_change") == true) {
                    throw {
                        message: gs.getMessage('Automated findings can only be configured on activities of type "All field values (Default)" that are not grouped. "{0}" is a grouped activity in this project.', [grfindingDef.field]),
                        status: "ERROR"
                    }

                } else if (grActivity.getValue("activity_of_interest") == true) {
                    throw {
                        message: gs.getMessage('Automated findings can only be configured on activities of type "All field values (Default)" that are not contextual activities. "{0}" is a contextual activity in this project.', [grfindingDef.field]),
                        status: "ERROR"
                    }
                }
				else if(grfindingDef.type == "EXTREME_TOUCH_POINT" && grEntity.getValue("enable_touch_point") == "0") {
					throw {
						message: gs.getMessage("This improvement opportunity is based on the touch point metric, but it is not enabled for the parent table."),
						status: "ERROR"
					};
				}
            } else {
                throw ({
                    message: gs.getMessage("There is no activity definition for the field: {0} in this project. Please create one before configuring this automated finding definition.", grfindingDef.field),
                    status: "ERROR"
                })
            }
        }
    },

    validateFindingDef: function(grfindingDef, operation) {
        try {
            if (!gs.nil(grfindingDef.project)) {
                this.validateFindingAD(grfindingDef, operation);
            }
            this._validateUniqueness(grfindingDef, operation);
            this._validateDotWalkLevels(grfindingDef);
            if (!gs.nil(grfindingDef.project)) {
                this._validateNoOfFindingsForProject(grfindingDef);
            }
            if (!grfindingDef.getValue('table').startsWith('ar_') && grfindingDef.getValue('table') != 'sn_aia_execution_plan') {
                this._validateField(grfindingDef, operation);
            }
            return {
                success: true,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
                status: error.status,
                findingId: error.findingId,
            };
        }
    },

    //Validate automated Config Values
    validateFindingConfig: function(grFindingDefConfig) {
        try {
            var configName = grFindingDefConfig.configuration_name;
            var type = grFindingDefConfig.automated_finding.type;
            var configValue = grFindingDefConfig.configuration_value;

            function getConfigErrorMsg(name) {
                return ({
                    message: gs.getMessage("The above mandatory field is Invalid or not filled in."),
                    configuration: gs.getMessage("{0}", name)
                });
            }

            configValue = Number(configValue);
            // minRatio and maxRatio config value can be positive decimal
            if ((configName == 'minRatio' || configName == 'maxRatio') && !configValue > 0) {
                throw getConfigErrorMsg(configName);
            } else if (!configValue > 0 && !Number.isInteger(configValue)) {
                throw getConfigErrorMsg(configName);
            }

            var configValue = parseInt(grFindingDefConfig.configuration_value);
            if ((type == "REWORK" || type == "PATTERN") && configName == "minRepetitions" && configValue < 2) {
                throw ({
                    message: gs.getMessage("This value cannot be less than 2."),
                    configuration: "minRepetitions"
                });
            } else if (type == "EXTRA_STEP" && configName == "minRepetitions" && configValue < 1) {
                throw ({
                    message: gs.getMessage("Minimum number of records cannot be less than 1."),
                    configuration: "minRepetitions"
                });
            } else if (type != "REWORK" && type != "PATTERN" && configName == "minRepetitions" && configValue < 1) {
                throw ({
                    message: gs.getMessage("This value cannot be less than 1."),
                    configuration: "minRepetitions"
                });
            } else if (configName == "maxFindings" && configValue < 0) {
                throw ({
                    message: gs.getMessage("This value cannot be less than 0."),
                    configuration: "maxFindings"
                });
            } else if (type == "EXTRA_STEP" && configName == "minRatio" && configValue < 1) {
                throw ({
                    message: gs.getMessage("The minimum percentage of records in the extra step variant cannot go beyond 100% of that in the regular variant as the extra step variant cannot have more records than the regular variant."),
                    configuration: "minRatio"
                });
            } else if (type == "EXTRA_STEP" && configName == "maxRatio" && configValue < 0) {
                throw ({
                    message: gs.getMessage("Extra step variant Percentage should be greater than 0."),
                    configuration: "maxRatio"
                });
            } else if (type == "EXTRA_STEP" && configName == "minRecordNumber" && configValue < 100) {
                throw ({
                    message: gs.getMessage("Minimum number of records cannot be less than 100."),
                    configuration: "minRecordNumber"
                });
            } else if (type == "EXTRA_STEP" && configName == "minEventNumber" && configValue < 4) {
                throw ({
                    message: gs.getMessage("Minimum number of steps cannot be less than 4."),
                    configuration: "minEventNumber"
                });
            } else if (type == "PATTERN" && configName == "minLength" && configValue < 3) {
                throw ({
                    message: gs.getMessage("This value cannot be less than 3."),
                    configuration: "minLength"
                });
            }

            //Extreme outlier detector config
            if (type == "EXTREME_DURATION" || type == "EXTREME_REPETITION") {
                if (configName == "maxDetectedRecords" && configValue < 1) {
                    throw ({
                        message: gs.getMessage("The percentage value cannot be less than 1."),
                        configuration: "maxDetectedRecords"
                    });
                }
                if (configName == "repetitionMultiplier" && configValue < 10) {
                    throw ({
                        message: gs.getMessage("This value cannot be less than 10."),
                        configuration: 'repetitionMultiplier'
                    });

                }
                if (configName == "durationMultiplier" && configValue < 10) {
                    throw ({
                        message: gs.getMessage("This value cannot be less than 10."),
                        configuration: "durationMultiplier"
                    });

                }
                if (configName == "minTotalRecords" && configValue < 20) {

                    throw ({
                        message: gs.getMessage("The number of records cannot be less than 20."),
                        configuration: "minTotalRecords"
                    });
                }
            }

            //Slow transition(Performance outlier detector)
            if (type == 'PERFORMANCE_OUTLIER') {
                if (configName == "minSampleSize" && configValue < 40) {
                    throw ({
                        message: gs.getMessage("The total occurences cannot be less than 40."),
                        configuration: "minSampleSize"
                    });
                }
                if (configName == "minTotalDurationMinutes" && configValue < 120) {
                    throw ({
                        message: gs.getMessage("This value cannot be less than 120."),
                        configuration: "minTotalDurationMinutes"
                    });
                }
                if (configName == "minSlowOccurrences" && configValue < 20) {
                    throw ({
                        message: gs.getMessage("The number of slow occurences cannot be less than 20."),
                        configuration: "minSlowOccurrences"
                    });
                }
                if (configName == "minNormalOccurrences" && configValue < 20) {
                    throw ({
                        message: gs.getMessage("The number regular occurences cannot be less than 20."),
                        configuration: "minNormalOccurrences"
                    });
                }
            }

            var ratioLimit = 1000; //for minRatio and maxRatio
            if (type == "EXTRA_STEP" && (configName == "minRatio" || configName == "maxRatio") && configValue > ratioLimit) {
                throw ({
                    message: gs.getMessage('Extra step variant Percentage should be greater than 0.'),
                    configuration: configName
                })
            }

            var maxFindingLimit = gs.getProperty("promin.limit.max_automated_finding", 25);
            if (configName == "maxFindings" && configValue > maxFindingLimit) {
                throw ({
                    message: gs.getMessage("This value cannot be more than 25."),
                    configuration: "maxFindings"
                })
            }
            return {
                success: true,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
                configuration: error.configuration
            };
        }
    },

    type: 'ProminFindingsValidationUtilSNC'
};
