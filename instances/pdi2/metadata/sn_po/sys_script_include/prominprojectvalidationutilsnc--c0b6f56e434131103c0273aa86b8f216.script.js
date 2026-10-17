var ProminProjectValidationUtilSNC = Class.create();
ProminProjectValidationUtilSNC.prototype = {
    initialize: function() {
        this.table = {
            "activityDef": "promin_activity_def",
            "breakdownDef": "promin_breakdown_field"
        };
        this._initializeConfig();
    },
    _initializeConfig: function() {
        this.rowLimitForTableDef = {};
        this.rowLimitForTableDef[this.table.activityDef] = {
            "parentProperty": "promin.limit.total_activity",
            "defaultParentsAllowed": 10,
            "childProperty": "promin.limit.child_total_activity",
            "defaultChildsAllowed": 5
        };
        this.rowLimitForTableDef[this.table.breakdownDef] = {
            "parentProperty": "promin.limit.breakdown_def",
            "defaultParentsAllowed": 10,
            "childProperty": "promin.limit.child_breakdown_def",
            "defaultChildsAllowed": 5
        };
        this.defaultActivityAllowed = {
            "parentProperty": "promin.limit.default_activity",
            "parentLimit": 5,
            "childProperty": "promin.limit.child_default_activity",
            "childLimit": 3
        };
    },

    // get the activity defs limit
    getActivityDefLimits: function() {
        return this.rowLimitForTableDef[this.table.activityDef];
    },

    isTableValid: function(currentEntity) {
        // Check if user has read access to table
        var grTable = new GlideRecord(currentEntity.table);
        var canReadTable = new global.ProminAllowedTableList().tableLevelACLAllow(grTable, "read");
        if (!canReadTable) {
            return {
                success: false,
                message: gs.getMessage('You do not have access to {0} table', grTable.getLabel()),
            };
        }

        if (currentEntity.source_type != 'TABLE') {
            return {
                success: true,
            };
        }

        // Check if table is allowed for process mining
        var isValidTable = new global.ProminAllowedTableList().getAllowedTableList([currentEntity.table]);
        if (gs.nil(isValidTable)) {
            return {
                success: false,
                message: gs.getMessage('Invalid table'),
            };
        }

        return {
            success: true,
        };
    },

    validateSourceAndTargetFields: function(currentEntity) {
        if (currentEntity.relation_type === 'CHILD' || currentEntity.relation_type === 'REFERENCE') {
            if (gs.nil(currentEntity.parent_entity) || gs.nil(currentEntity.source_field) || gs.nil(currentEntity.target_field)) {
                return {
                    success: false,
                    message: gs.getMessage('Source or Target field cannot be empty.')
                };
            }
        }

        return {
            success: true
        };
    },

    validateTemplate: function(currentEntity) {
        var grProject = new GlideRecordSecure('promin_project');
        grProject.get(currentEntity.project);
        if (gs.nil(currentEntity.parent_entity) && grProject.is_template) {
            var grProjectEntity = new GlideRecordSecure('promin_project_entity');
            grProjectEntity.addQuery('project.is_template', true);
            grProjectEntity.addQuery('project.template_type', grProject.template_type);
            grProjectEntity.addNullQuery('parent_entity');
            grProjectEntity.addQuery('table', currentEntity.table);
            grProjectEntity.addQuery('sys_id', '!=', currentEntity.getUniqueValue());
            grProjectEntity.setLimit(1);
            grProjectEntity.query();

            if (grProjectEntity.next()) {
                return {
                    success: false,
                    message: gs.getMessage('Only one template is allowed per one parent table configuration'),
                };
            }
        }

        return {
            success: true,
        };
    },

    canEntityBeUsedInTemplate: function(currentEntity, templateType) {
        if (gs.nil(currentEntity.parent_entity)) {
            var grProjectEntity = new GlideRecordSecure('promin_project_entity');
            grProjectEntity.addQuery('project.is_template', true);
            grProjectEntity.addQuery('project.template_type', templateType);
            grProjectEntity.addNullQuery('parent_entity');
            grProjectEntity.addQuery('table', currentEntity.table);
            grProjectEntity.addQuery('sys_id', '!=', currentEntity.getUniqueValue());
            grProjectEntity.setLimit(1);
            grProjectEntity.query();

            if (grProjectEntity.next()) {
                return {
                    success: false,
                    message: gs.getMessage('Only one template is allowed per one parent table configuration'),
                };
            }
        }

        return {
            success: true,
        };
    },

    _validateActivitiesAndTouchPointsCount: function(entityId, operation, touchPointsCount) {
        var gr = new GlideRecordSecure('promin_activity_def');
        gr.addQuery('entity', '=', entityId);
        gr.query();
        var existingDefsCount = gr.getRowCount();
        var validationUtil = new sn_po.ProminProjectValidationUtil();
        var defsLimit = this.rowLimitForTableDef[this.table.activityDef].defaultParentsAllowed;

        var metricsCount = touchPointsCount ? touchPointsCount : 0;

        // regular case non-touch points
        if (!touchPointsCount) {
            var grEntity = new GlideRecordSecure('promin_project_entity');
            grEntity.get(entityId);
            grEntity.query();
            if (grEntity.next()) {
                var fields = grEntity.getValue('touch_point_fields');
                var touchPointsEnabled = grEntity.getValue('enable_touch_point');
                metricsCount = fields && touchPointsEnabled ? fields.split(',').length : 0;
            }
        }

        var overFlowCount = (Number(existingDefsCount) + Number(metricsCount)) - Number(defsLimit);

        // message for Including Touch Points Metrics
        if (touchPointsCount) {
            if (overFlowCount > 0) {
                var subject = overFlowCount > 1 ? gs.getMessage('activities') : gs.getMessage('activity');
                throw gs.getMessage('Failed to add required fields to the project scope. Remove {0} {1} and try again.', [overFlowCount.toString(), subject]);
            }
        } else if (overFlowCount >= 0) {
            // message for Activities creation
            throw gs.getMessage('Unable to save activity. Activity limit has been reached. To continue, remove an existing activity or exclude a metric from the project scope.');
        }
    },

    validateActivityDef: function(grActivityDef, operation, touchPointsCount) {
        try {
            if (operation !== "update") {
                this._validateActivitiesAndTouchPointsCount(grActivityDef.entity, operation, touchPointsCount);
            }
            this._validateDefaultActivityLimit(grActivityDef, operation);
            this._validateTableDefinition(grActivityDef, operation);
            this._hasDuplicateDisplayName(grActivityDef);

            if (grActivityDef.getValue("type") == "DEFAULT") {
                this._validateDotWalkLevelsForActivityDef(grActivityDef);
            }
            if (grActivityDef.getValue("type") != "DEFAULT") {
                this._validateAttachedEntityActivity(grActivityDef);
            }
            if (grActivityDef.activity_of_interest && grActivityDef.track_change) {
                throw gs.getMessage("Contextual activity cannot be grouped.");
            }
            if (grActivityDef.choose_values && !grActivityDef.field_values) {
                throw gs.getMessage("Please choose the activity values or de-select 'Choose activity values' before proceeding.");
            }
            if (grActivityDef.getValue("type") == "DATE_TIME") {
                var internalType = new global.ProminUtils().getInternalTypeOfSelectedField(grActivityDef.entity.table, grActivityDef.field);
                if (internalType != "glide_date_time") {
                    throw gs.getMessage("Selected field '{0}' is not of type 'Date Time'.", this._getReferenceFieldLabel(grActivityDef.entity.table, grActivityDef.field));
                }
            }
            if (grActivityDef.getValue("type") == "COMPOUND") {
                this._isDuplicateChildTableDefPresent(grActivityDef, operation);
            }

            // Non-audited tables for source type TABLE and REPORT_SOURCE can only have activity defs of type DATE_TIME
            if ((grActivityDef.entity.source_type == 'TABLE' || grActivityDef.entity.source_type == 'REPORT_SOURCE') && grActivityDef.getValue("type") != "DATE_TIME") {
                var grDictionary = new GlideRecord('sys_dictionary');
                grDictionary.addEncodedQuery('name=' + grActivityDef.entity.table + '^internal_type=collection', false);
                grDictionary.query();
                if (!grDictionary.next()) {
                    throw gs.getMessage("Entity table not found");
                }
                if (!grDictionary.audit) {
                    throw gs.getMessage("Non-audited tables ({0}) can only have Activities of type Date Time", [grActivityDef.entity.table]);
                }
            }

            return {
                success: true,
            };
        } catch (error) {
            gs.error(error);
            return {
                success: false,
                message: error,
            };
        }
    },

    validateBreakdownDef: function(grBreakdown, operation) {
        try {
            this._validateDotWalkLevels(grBreakdown);
            this._validateTableDefinition(grBreakdown, operation);
            this._hasDuplicateDisplayName(grBreakdown);

            return {
                success: true,
            };
        } catch (error) {
            gs.error(error);
            return {
                success: false,
                message: error,
            };
        }
    },

    _validateDefaultActivityLimit: function(grProminTable, operation) {
        if (grProminTable.getValue("type") == "DEFAULT" &&
            grProminTable.getValue("activity_of_interest") == false) {
            var limit;
            if (this._isDefinitionForParent(grProminTable)) {
                limit = gs.getProperty(this.defaultActivityAllowed.parentProperty, this.defaultActivityAllowed.parentLimit);
            } else {
                limit = gs.getProperty(this.defaultActivityAllowed.childProperty, this.defaultActivityAllowed.childLimit);
            }
            var gaTable = new GlideAggregate(grProminTable.getTableName());
            gaTable.addQuery("entity", grProminTable.getValue("entity"));
            gaTable.addQuery("type", "DEFAULT");
            gaTable.addQuery("activity_of_interest", false);
            if (operation === "update") {
                gaTable.addQuery("sys_id", "!=", grProminTable.getUniqueValue());
            }
            gaTable.addAggregate("COUNT");
            gaTable.query();
            if (gaTable.next()) {
                var count = gaTable.getAggregate("COUNT");
                if (parseInt(count) >= parseInt(limit)) {
                    throw gs.getMessage("You can enter up to {0} Field Values (Default) type {1}s for this entity.",
                        [limit, grProminTable.getClassDisplayValue()]);
                }
            }
        }
    },

    _validateDotWalkLevelsForActivityDef: function(grActivityDef) {
        var activityValue = grActivityDef.field;
        if (activityValue.contains(".")) {
            var limit = gs.getProperty("promin.limit.max_activity_dot_walk_levels", 3);
            var activity = activityValue.split(".");
            var levels = activity.length;
            if (levels > parseInt(limit)) {
                throw gs.getMessage("Dot walk limit reached: You can dot.walk up to {0} levels deep, with the parent table as the first level.", limit);
            }
        }
    },

    _validateDotWalkLevels: function(grBreakdown) {
        var breakdownValue = grBreakdown.field;
        if (breakdownValue.contains(".")) {
            var limit = gs.getProperty("promin.limit.breakdown_dot_walk", 3);
            var breakdowns = breakdownValue.split(".");
            var levels = breakdowns.length;
            if (levels > parseInt(limit)) {
                throw gs.getMessage("The limit for dot walking in breakdown field is {0} levels", limit);
            }
        }
    },

    _validateAttachedEntityActivity: function(activityDefGr) {
        var type = activityDefGr.type;
        if (type == "CHILD_ATTACHED") {
            var grEntity = new GlideRecord("promin_project_entity");
            if (!grEntity.get(activityDefGr.attached_entity)) {
                throw gs.getMessage("Invalid child attached '{0}'. Table Configuration not found.", activityDefGr.attached_entity);
            } else if (grEntity.project != activityDefGr.entity.project || grEntity.parent_entity != activityDefGr.entity || grEntity.relation_type != "CHILD") {
                throw gs.getMessage("Invalid child attached '{0}'. Please attach a table configuration of 'Child' relation type for '{1}' table configuration within this project.", [activityDefGr.attached_entity.getDisplayValue(), activityDefGr.entity.getDisplayValue()]);
            }
        } else if (type == "PARENT_ATTACHED") {
            if (activityDefGr.entity.relation_type != "REFERENCE") {
                throw gs.getMessage("Invalid parent attached '{0}'. Please attach a table configuration of 'Reference' relation type for '{1}' table configuration within this project.", [activityDefGr.attached_entity.getDisplayValue(), activityDefGr.entity.getDisplayValue()]);
            } else if (activityDefGr.entity.parent_entity.getRefRecord().getUniqueValue() != activityDefGr.attached_entity) {
                throw gs.getMessage("Invalid parent attached '{0}'.", activityDefGr.attached_entity.getDisplayValue());
            }
        }
    },

    _hasDuplicateDisplayName: function(grProminTable) {
        if (grProminTable.getValue('display_name')) {
            var gaProminTable = new GlideAggregate(grProminTable.getTableName());
            var currentName = grProminTable.getValue('display_name');
            gaProminTable.addQuery('entity', grProminTable.getValue('entity'));
            gaProminTable.addQuery('display_name', currentName);
            gaProminTable.addQuery('sys_id', '!=', grProminTable.getUniqueValue());
            gaProminTable.addAggregate("COUNT");
            gaProminTable.query();
            if (gaProminTable.next()) {
                if (gaProminTable.getAggregate('COUNT') > 0) {
                    throw gs.getMessage("Duplicate display name: '{0}' is already present in another {1}. Please try giving another display name",
                        [currentName, grProminTable.getClassDisplayValue()]
                    );
                }
            }
        }
    },

    _validateTableDefinition: function(grConfigTable, operation) {
        try {
            if (!grConfigTable.isValid()) {
                throw gs.getMessage("Can not validate definition change.");
            }
            var tableName = grConfigTable.getTableName();
            this._canCreateChildTableDefinition(grConfigTable, operation);
            this._isExceedTableDefRowLimit(grConfigTable, this.rowLimitForTableDef[tableName], operation);
            this._isDuplicateChildTableDefPresent(grConfigTable, operation);

        } catch (error) {
            gs.error(error);
            throw error;
        }
    },

    _canCreateChildTableDefinition: function(grEntityConfigDef, operation) {
        if (operation === "insert") {

            /* used in insert BR of activity/breakdown */
            var grProject = grEntityConfigDef.entity.project.getRefRecord();

            if (gs.nil(grProject) || !grProject.isValidRecord())
                throw gs.getMessage("Invalid project");

            var canCreateNewRecord = new global.ProminACLUtil(grProject).canWriteInChildTableDef();

            if (!canCreateNewRecord) {
                throw gs.getMessage('You do not have required permission to create a new {0}.', [
                    grEntityConfigDef.getClassDisplayValue().toLowerCase()
                ]);
            }
        }
    },

    _isExceedTableDefRowLimit: function(grProminTable, tableDefLimits, operation) {
        if (operation === 'insert') {
            var limit;
            if (this._isDefinitionForParent(grProminTable)) {
                limit = gs.getProperty(tableDefLimits.parentProperty, tableDefLimits.defaultParentsAllowed);
            } else {
                limit = gs.getProperty(tableDefLimits.childProperty, tableDefLimits.defaultChildsAllowed);
            }
            var gaTable = new GlideAggregate(grProminTable.getTableName());
            gaTable.addQuery("entity", grProminTable.getValue("entity"));
            gaTable.addAggregate("COUNT");
            gaTable.query();
            if (gaTable.next()) {
                var count = gaTable.getAggregate("COUNT");
                if (parseInt(count) >= parseInt(limit)) {
                    throw gs.getMessage("You can enter up to {0} {1}s for this entity.",
                        [limit, grProminTable.getClassDisplayValue()]);
                }
            }
        }
    },

    _isDefinitionForParent: function(grConfigTable) {
        return gs.nil(grConfigTable.entity.parent_entity);
    },

    _isDuplicateChildTableDefPresent: function(grProminTable, operation) {
        var gaProminTable = new GlideAggregate(grProminTable.getTableName());
        gaProminTable.addEncodedQuery(this._getQueryForDuplicateRecordCheck(grProminTable, operation));
        gaProminTable.addAggregate("COUNT");
        gaProminTable.query();
        if (gaProminTable.next()) {
            if (gaProminTable.getAggregate('COUNT') > 0) {
                throw gs.getMessage("Duplicate Record: {0} is already present as {1} ",
                    [this._getDuplicateFieldLabel(grProminTable), grProminTable.getClassDisplayValue()]
                );
            }
        }
    },

    _getQueryForDuplicateRecordCheck: function(grProminTable, operation) {
        var query = '';
        var uniqueFieldsByTable = {};
        uniqueFieldsByTable[this.table.activityDef] = ["entity", "field", "attached_entity"];
        uniqueFieldsByTable[this.table.breakdownDef] = ["entity", "field"];

        var uniqueFields = uniqueFieldsByTable[grProminTable.getTableName()];
        if (uniqueFields) {
            uniqueFields.forEach(function(field) {
                if (grProminTable.getValue(field)) {
                    query += field + '=' + grProminTable.getValue(field) + '^';
                }
            });
            if (operation === 'update') {
                query += 'sys_id!=' + grProminTable.getUniqueValue();
            }
            if (grProminTable.getTableName() == this.table.activityDef) {
                if (grProminTable.getValue('type') != 'DEFAULT' && grProminTable.getValue('type') != 'COMPOUND' && grProminTable.getValue('type') != 'DATE_TIME') {
                    query += 'type=' + grProminTable.getValue('type') + '^';
                }
            }
        }
        return query;
    },
    _getReferenceFieldLabel: function(rootTable, inputField) {
        if (!inputField || !rootTable) {
            return '';
        }

        var table = rootTable;
        var labels = [];
        var fieldList = inputField.split('.');

        for (var i = 0; i < fieldList.length; i++) {
            var gr = new GlideRecord(table);

            // Check if table is valid
            if (!gr.isValid()) {
                break;
            }

            // Check if field exists on the table
            if (!gr.isValidField(fieldList[i])) {
                break;
            }

            var element = gr.getElement(fieldList[i]);
            var ed = element.getED();
            labels.push(ed.getLabel());

            // Only get next table if we're not at the last field
            if (i < fieldList.length - 1) {
                var refTable = ed.getReference();
                if (!refTable) {
                    break;
                }
                table = refTable;
            }
        }

        return labels.join(" ");
    },

    _getDuplicateFieldLabel: function(grProminTable) {
        var tableName = grProminTable.entity.table;
        var fieldName = grProminTable.getValue("field");
        if (grProminTable.getTableName() == "promin_activity_def" && !fieldName) {
            return gs.getMessage("The attached entity '{0}'", grProminTable.getDisplayValue("attached_entity"));
        }
        if (fieldName.split('.').length > 1) {
            return this._getReferenceFieldLabel(tableName, fieldName);
        }
        var tables = '';
        tables += new GlideTableHierarchy(tableName).getTables().toString();
        if (tables) {
            var grDictionary = new GlideRecord('sys_dictionary');
            grDictionary.addQuery('name', 'IN', tables.replace(/[\][]/g, '').replace(/ +?/g, ''));
            grDictionary.addQuery('element', fieldName);
            grDictionary.query();
            if (grDictionary.next()) {
                return "'" + grDictionary.getValue('column_label') + "'";
            }
        }
        return '';

    },

    type: 'ProminProjectValidationUtilSNC'
};
