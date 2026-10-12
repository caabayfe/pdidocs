var ProminProjectDefUtilSNC = Class.create();
ProminProjectDefUtilSNC.prototype = {
    initialize: function() {
        this.perspectivesEnum = {
            CONTROL_FLOW: "CONTROL_FLOW",
            RESOURCE_GROUP: "RESOURCE_GROUP",
            RESOURCE_USER: "RESOURCE_USER",
            OTHER: "OTHER"
        };
    },
    getProjectInfo: function(projectId) {
        try {
            var grProject = new GlideRecordSecure('promin_project');
            if (!grProject.get(projectId)) {
                grProject.newRecord();
            }
            return {
                success: true,
                errorMessage: '',
                projectInfo: {
                    permissions: this.getProjectPermissions(grProject),
                    isShared: this.isSharedProject(grProject).result,
                    autoRetiredMessage: this.getProjectAutoRetiredMessage(grProject),
                    userInfo: this.getUserInfo().userInfo,
                },
            };
        } catch (err) {
            return {
                success: false,
                errorMessage: gs.getMessage('Error while fetching project info: {0}', err),
            };
        }
    },
    getProminAllowedTables: function(sourceType, includeExternalData, excludeNonAuditedTables) {
        var allowedTables = new global.ProminAllowedTableList().getAllowedTableList([], sourceType, true);
        if (!allowedTables || allowedTables.length === 0) {
            return {
                success: true,
                message: gs.getMessage('Success'),
                tables: [],
            };
        }
        return {
            success: true,
            message: gs.getMessage('Success'),
            tables: allowedTables,
        };
    },

    getTableList: function(sourceType, searchTerm) {
        if (gs.nil(searchTerm)) {
            searchTerm = "";
        }

        var tablesResponse = new global.ProminAllowedTableList().getAllowedTableListWithSearch(sourceType, searchTerm);
        var tableList = tablesResponse.tables;
        var rowCount = tablesResponse.rowCount;

        if (!tableList || tableList.length === 0) {
            return {
                success: true,
                tables: [],
                rowCount: rowCount,
            };
        }
        var tables = [];
        for (var i = 0; i < tableList.length; i += 1) {
            tables.push({
                id: tableList[i].name,
                label: tableList[i].label,
            });
        }
        return {
            success: true,
            tables: tables,
            rowCount: rowCount,
        };
    },

    getRelatedTables: function(table, searchTerm) {
        var relatedTables = [];
        var grDbObject = new GlideRecord('sys_db_object');
        this._addRelatedTablesFilters(grDbObject, table, searchTerm);
        grDbObject.orderBy("label");
        grDbObject.setLimit(15);
        grDbObject.query();
        while (grDbObject.next()) {
            tableName = grDbObject.getValue('name');
            tableLabel = grDbObject.getDisplayValue("label");
            if (gs.nil(tableName)) {
                continue;
            }
            if (gs.nil(tableLabel)) {
                tableLabel = tableName;
            }
            relatedTables.push({
                id: tableName,
                label: tableLabel,
            });
        }

        // Calculate row count
        var ga = new GlideAggregate('sys_db_object');
        this._addRelatedTablesFilters(ga, table, searchTerm);
        ga.query();

        var rowCount = ga.getRowCount();

        if (!relatedTables || relatedTables.length === 0) {
            return {
                success: true,
                tables: [],
                rowCount: rowCount,
            };
        }
        return {
            success: true,
            tables: relatedTables,
            rowCount: rowCount,
        };
    },

    _addRelatedTablesFilters: function(gr, table, searchTerm) {
        var gth = new GlideTableHierarchy(table);
        gr.addEncodedQuery("super_class.nameIN" + GlideStringUtil.escapeQueryTermSeparator(gth.getTables()));
        if (!gs.nil(searchTerm)) {
            gr.addEncodedQuery("labelSTARTSWITH" + GlideStringUtil.escapeQueryTermSeparator(searchTerm) + "^ORnameSTARTSWITH" + GlideStringUtil.escapeQueryTermSeparator(searchTerm));
        }
    },

    isPrimaryEntityValid: function(tableName) {
        try {
            var gr = new GlideRecord('sys_dictionary');
            gr.addEncodedQuery('name=' + GlideStringUtil.escapeQueryTermSeparator(tableName) + '^internal_type=collection^audit=true');
            gr.query();

            var grTable = new GlideRecord(tableName);
            var tableLabel = grTable.getLabel();

            var auditEnabled = gr.hasNext();
            var canRead = new global.ProminGlideUtil().hasReadAccess(tableName);

            if (auditEnabled && canRead) {
                return {
                    success: true,
                    message: '',
                };
            } else if (canRead && !auditEnabled) {
                return {
                    success: false,
                    message: gs.getMessage('{0} table is not valid for mining', tableLabel),
                };
            } else if (!canRead && auditEnabled) {
                return {
                    success: false,
                    message: gs.getMessage('You do not have access to {0} table', tableLabel),
                };
            }

            return {
                success: false,
                message: gs.getMessage('{0} table is not valid for mining', tableLabel),
            };
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage('Something went wrong'),
            };
        }
    },

    getProminProjectTables: function() {
        try {
            var tables = [];
            var ga = new GlideAggregate('promin_project_entity');
            ga.addAggregate('GROUP_CONCAT_DISTINCT', 'table');
            ga.query();

            while (ga.next()) {
                var table = ga.getAggregate('GROUP_CONCAT_DISTINCT', 'table');
                var grTable = new GlideRecord(table);
                tables.push({
                    name: table,
                    label: grTable.getLabel(),
                });
            }
            return {
                success: true,
                message: gs.getMessage('Success'),
                tables: tables,
            };
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage('Fail'),
                tables: [],
            };
        }
    },

    getProminTablesRefFields: function(params) {
        var tableFields = [];
        var refFieldList = [];
        var queryTable = GlideStringUtil.escapeQueryTermSeparator(params.currentEntityTable);
        var referenceTable = GlideStringUtil.escapeQueryTermSeparator(params.referenceEntityTable);
        var relationType = params.relationType;
        var parentEntitySource = params.parentEntitySource;
        var childEntitySource = params.childEntitySource;
        var allQueryTable = '';
        var allTables = '';
        var encodedQuery = '';

        if (gs.nil(queryTable) || gs.nil(referenceTable) || gs.nil(relationType)) {
            return {
                message: gs.getMessage('Missing required parameters'),
                success: false,
                fields: [],
            };
        }

        if (relationType == 'CHILD') {
            allQueryTable = new GlideTableHierarchy(queryTable).getTables().toString();
            allQueryTable = allQueryTable.replace(/[\][]/g, '').replace(/ +?/g, '');

            allTables += new GlideTableHierarchy(referenceTable).getTables().toString();
            allTables = allTables.replace(/[\][]/g, '').replace(/ +?/g, '');
            encodedQuery = 'nameIN' + allQueryTable;
            if (parentEntitySource == 'EXTERNAL_DATA') {
                var fieldQuery = 'elementIN';
                encodedQuery += '^internal_type!=domain_id^internal_type!=domain_path^internal_type!=glide_date_time^internal_type!=GUID^internal_type!=boolean^internal_type!=reference^' + fieldQuery + this._getIndexColumns(queryTable);
            } else {
                encodedQuery += '^internal_type=reference^referenceIN' + allTables.toString();
            }
        } else if (relationType == 'REFERENCE') {
            queryTable = GlideStringUtil.escapeQueryTermSeparator(params.referenceEntityTable);
            allQueryTable += new GlideTableHierarchy(queryTable).getTables().toString();
            allQueryTable = allQueryTable.replace(/[\][]/g, '').replace(/ +?/g, '');

            referenceTable = GlideStringUtil.escapeQueryTermSeparator(params.currentEntityTable);
            allTables += new GlideTableHierarchy(referenceTable).getTables().toString();
            allTables = allTables.replace(/[\][]/g, '').replace(/ +?/g, '');
            encodedQuery = 'nameIN' + allQueryTable;
            if (childEntitySource == 'EXTERNAL_DATA') {
                fieldQuery = 'elementIN';
                encodedQuery += '^internal_type!=domain_id^internal_type!=domain_path^internal_type!=glide_date_time^internal_type!=GUID^internal_type!=boolean^internal_type!=reference^' + fieldQuery + this._getIndexColumns(queryTable);
            } else {
                encodedQuery += '^internal_type=reference^referenceIN' + allTables.toString();
            }
        }

        var grDictionary = new GlideRecord("sys_dictionary");
        grDictionary.addActiveQuery();
        grDictionary.addEncodedQuery(encodedQuery);
        grDictionary.orderBy("column_label");
        grDictionary.query();
        while (grDictionary.next()) {
            var fieldOption = {};
            fieldOption.label = grDictionary.getDisplayValue("column_label");
            fieldOption.name = grDictionary.getValue("element");
            fieldOption.refTable = grDictionary.getValue("reference") || "";

            if (grDictionary.getValue("internal_type") == "reference" && fieldOption.refTable != "") {
                fieldOption.label += gs.getMessage("(reference of '{0}' table)", fieldOption.refTable);
            }
            tableFields.push(fieldOption);
        }

        //sort tableFields array to show direct reference first
        for (var cnt = 0; cnt < tableFields.length; cnt++) {
            if (tableFields[cnt].refTable == referenceTable) {
                refFieldList.push(tableFields[cnt]);
            }
        }
        for (cnt = 0; cnt < tableFields.length; cnt++) {
            if (tableFields[cnt].refTable != referenceTable) {
                refFieldList.push(tableFields[cnt]);
            }
        }

        if (refFieldList.length == 0) {
            return {
                message: 'There are no fields present in ' + queryTable + ' table which has relation with ' + referenceTable + ' table. Please check the configuration or contact your system administrator',
                success: false,
                fields: [],
            };
        }

        return {
            message: 'Success',
            success: true,
            fields: refFieldList,
        };
    },

    _getIndexColumns: function(tableName) {
        var columnList = {};
        var grTable = new GlideRecord("sys_db_object");
        grTable.addQuery("name", tableName);
        grTable.query();
        if (grTable.next()) {
            var grIndex = new GlideRecord("v_index_creator");
            grIndex.addQuery("table", grTable.getUniqueValue());
            grIndex.query();
            while (grIndex.next()) {
                var fields = grIndex.getValue("index_col_name").split(",");
                fields.forEach(function(field) {
                    columnList[field.trim()] = field.trim();
                });
            }
        }
        return Object.keys(columnList).toString();
    },

    getProminAllowedColumnList: function(params) {
        try {
            var columnList = new global.ProminAllowedColumnList().process(params.tableName, params.currentTableName, params.entityId, true, true);
            var outFields = [];
            for (var i = 0; i < columnList.length; i += 1) {
                var field = columnList[i];
                var table = params.tableName;
                var recObj = new GlideRecord(table);
                if (!recObj.isValid() || !recObj.isValidField(field)) {
                    continue;
                }
                var glideElement = recObj.getElement(field);
                var descriptor = glideElement.getED();
                var fieldDetails = {};
                fieldDetails.isChoiceTable = descriptor.isChoiceTable();
                fieldDetails.internalType = descriptor.getInternalType();
                fieldDetails.isExternalDataTable = this.isExternalDataTable(table);

                var stringBreakdownMaxLength = parseInt(gs.getProperty('promin.limit.max_string_breakdown_column_length', 250));

                if (fieldDetails.isChoiceTable) {
                    fieldDetails.internalType = "choice";
                } else if (fieldDetails.internalType == "reference") {
                    fieldDetails.referenceTable = recObj[field].getRefRecord().getTableName();
                } else if (fieldDetails.internalType == "string" && params.currentTableName == 'promin_breakdown_field' && this._getFieldMaxLength(params.tableName, field) > stringBreakdownMaxLength) {
                    continue;
                }
                outFields.push({
                    name: field,
                    internalType: fieldDetails.internalType,
                    label: descriptor.getLabel(),
                    referenceTable: fieldDetails.referenceTable ? fieldDetails.referenceTable : '',
                });
            }

            return {
                message: gs.getMessage('OK'),
                success: true,
                fields: outFields,
            };
        } catch (err) {
            return {
                message: gs.getMessage('Error trying to fetch fields'),
                success: false,
                fields: [],
            };
        }
    },

    _getFieldMaxLength: function(table, field) {
        function getMaxLength(table, field) {
            var dictGR = new GlideRecord('sys_dictionary');
            dictGR.addQuery('name', table);
            dictGR.addQuery('element', field);
            dictGR.query();

            if (dictGR.next()) {
                return dictGR.max_length; // Return the max length if found
            }
            return null; // Return null if not found
        }

        // Get the full table hierarchy (including parent tables)
        var hierarchy = new GlideTableHierarchy(table).getHierarchy();

        var maxLength = null;
        var foundInTable = null;

        for (var i = 0; i < hierarchy.length; i++) {
            var currentTable = hierarchy[i];
            maxLength = getMaxLength(currentTable, field);
            if (maxLength !== null) {
                foundInTable = currentTable;
                break; // Stop searching once we find the field
            }
        }

        return maxLength;
    },

    getProminActivityFieldDetails: function(params) {
        var table = params.tableName;
        var field = params.field;
        var label = "";
        if (field.split('.').length > 1) {
            var dotWalkFieldInfo = this.getReferenceFieldLabel(table, field);
            table = dotWalkFieldInfo.table;
            label = dotWalkFieldInfo.label;
            var fieldParts = field.split('.');
            field = fieldParts[fieldParts.length - 1];
        }
        var recObj = new GlideRecord(table);
        if (!recObj.isValid() || !recObj.isValidField(field)) {
            return {
                message: gs.getMessage('Invalid parameters. Please check the table and field parameters.'),
                success: false,
            };
        }
        var glideElement = recObj.getElement(field);
        var descriptor = glideElement.getED();
        var fieldDetails = {};
        fieldDetails.isChoiceTable = descriptor.isChoiceTable();
        fieldDetails.internalType = descriptor.getInternalType();
        fieldDetails.label = label || descriptor.getLabel();
        fieldDetails.isExternalDataTable = this.isExternalDataTable(table);

        if (fieldDetails.isChoiceTable) {
            fieldDetails.internalType = "choice";
        } else if (fieldDetails.internalType == "reference") {
            fieldDetails.referenceTable = recObj[field].getRefRecord().getTableName();
        }
        return {
            message: 'OK',
            success: true,
            fieldDetails: fieldDetails,
        };
    },

    isExternalDataTable: function(tableName) {
        var dataSetTable = "sn_po_extdata_dataset";
        if (gs.tableExists(dataSetTable)) {
            var grExternalDataSet = new GlideRecord(dataSetTable);
            grExternalDataSet.addQuery("status", "READY");
            grExternalDataSet.addQuery("case_table", tableName);
            grExternalDataSet.query();
            return grExternalDataSet.hasNext();
        }
        return false;
    },

    addUsersToProjectWatchList: function(params) {
        var projectId = params.projectId;
        var userIds = params.userIds;
        var response;

        try {
            var rec = new GlideRecord('promin_project');
            if (!rec.canWrite()) {
                return {
                    success: false,
                    message: gs.getMessage('User do not have permission to perform this operation'),
                };
            }
            rec.addQuery('sys_id', projectId);
            rec.query();
            while (rec.next()) {
                var watch_list = (rec.getValue('watch_list') || '').split(',');
                watch_list = watch_list.concat(userIds);
                var watch_list_uniq = this._removeDuplicates(watch_list);
                rec.setValue('watch_list', watch_list_uniq.join(','));
                var id = rec.update();
                if (gs.nil(id)) {
                    return {
                        message: gs.getMessage('Add users to watch list failed'),
                        success: false
                    };
                }
            }
            response = {
                message: 'Success',
                success: true
            };
        } catch (e) {
            gs.error(e);
            response = {
                message: 'Error',
                success: false
            };
        }
        return response;
    },

    createProminEntity: function(payload) {
        var grEntity = new GlideRecordSecure('promin_project_entity');
        if (!grEntity.canCreate()) {
            return {
                success: false,
                message: gs.getMessage('You do not have permissions to create an entity.'),
            };
        }
        grEntity.initialize();

        for (var key in payload) {
            grEntity.setValue(key, payload[key]);
        }

        var validationUtil = new sn_po.ProminProjectValidationUtil();

        var validationResponse = validationUtil.isTableValid(grEntity);
        if (!validationResponse.success) {
            return validationResponse;
        }

        validationResponse = validationUtil.validateSourceAndTargetFields(grEntity);
        if (!validationResponse.success) {
            return validationResponse;
        }

        validationResponse = validationUtil.validateTemplate(grEntity);
        if (!validationResponse.success) {
            return validationResponse;
        }

        var newEntityId = grEntity.insert();
        if (!newEntityId) {
            return {
                success: false,
                message: gs.getMessage('Error occurred while creating entity.'),
            };
        }

        this._autoAddActivities(grEntity.getValue("table"), newEntityId);

        return {
            success: true,
            message: 'Entity created',
            entityId: newEntityId,
        };
    },

    // Create activities if they are setup in process configuration
    _autoAddActivities: function(table, entityId) {
        var activityPayload = [];
        var grVfc = new GlideRecord("promin_view_field_config");
        grVfc.addQuery("process_def.table", table);
        grVfc.addQuery("process_def.content_pack", false);
        grVfc.addQuery("include_in_new_project", true);
        grVfc.query();

        while (grVfc.next()) {
            activityPayload.push({
                "entity": entityId,
                "display_name": "",
                "type": "DEFAULT",
                "field": grVfc.getValue("field"),
                "activity_of_interest": false,
                "track_change": false,
                "field_display_values": "",
                "field_values": "",
                "choose_values": false,
                "change_name": "",
                "attached_entity": null,
                "include_empty_start_node": false
            });
        }
        if (activityPayload.length) {
            this.createMultipleProminActivities(activityPayload);
        }
    },

    updateProminEntity: function(sysId, payload) {
        var grEntity = new GlideRecordSecure('promin_project_entity');
        if (!grEntity.canWrite()) {
            return {
                success: false,
                message: 'You do not have permissions to update this entity'
            };
        }

        grEntity.get(sysId);

        for (key in payload) {
            grEntity.setValue(key, payload[key]);
        }

        var validationUtil = new sn_po.ProminProjectValidationUtil();

        var validationResponse = validationUtil.isTableValid(grEntity);
        if (!validationResponse.success) {
            return validationResponse;
        }

        validationResponse = validationUtil.validateSourceAndTargetFields(grEntity);
        if (!validationResponse.success) {
            return validationResponse;
        }

        validationResponse = validationUtil.validateTemplate(grEntity);
        if (!validationResponse.success) {
            return validationResponse;
        }

        var id = grEntity.update();
        if (gs.nil(id)) {
            return {
                success: false,
                message: gs.getMessage('Entity update failed'),
            };
        }

        return {
            success: true,
            message: 'Entity updated',
        };
    },

    createProminActivity: function(payload) {
        var grActivity = new GlideRecordSecure('promin_activity_def');
        if (!grActivity.canCreate()) {
            return {
                success: false,
                message: 'You do not have permissions to create activities.'
            };
        }
        grActivity.initialize();

        for (var key in payload) {
            grActivity.setValue(key, payload[key]);
        }
        var validationUtil = new sn_po.ProminProjectValidationUtil();
        var validationResponse = validationUtil.validateActivityDef(grActivity, 'insert');
        if (!validationResponse.success) {
            return validationResponse;
        }

        grActivity.insert();

        return {
            success: true,
            message: 'Activity created',
        };
    },
    updateProminActivity: function(sysId, payload) {
        var grActivity = new GlideRecordSecure('promin_activity_def');
        if (!grActivity.canWrite()) {
            return {
                success: false,
                message: 'You do not have permissions to update this activity'
            };
        }

        grActivity.get(sysId);

        for (key in payload) {
            grActivity.setValue(key, payload[key]);
        }

        var validationUtil = new sn_po.ProminProjectValidationUtil();
        var validationResponse = validationUtil.validateActivityDef(grActivity, 'update');
        if (!validationResponse.success) {
            return validationResponse;
        }

        new global.GlideQuery('promin_activity_def')
            .where('sys_id', sysId)
            .update(payload);

        return {
            success: true,
            message: 'Activity updated',
        };
    },

    createMultipleProminActivities: function(payload) {
        if (!Array.isArray(payload))
            return {
                success: false,
                message: gs.getMessage('Invalid parameter. Activity creation failed.'),
            };
        try {
            for (var i = 0; i < payload.length; i++) {
                this.createProminActivity(payload[i]);
            }
            return {
                success: true,
                message: gs.getMessage('Operation success: Created activities'),
            };

        } catch (e) {
            gs.error(e);
            return {
                success: false,
                message: gs.getMessage('Operation failed: Error while creating activities.'),
            };
        }
    },

    getProjectDirtyMessage: function(projectId, currentTableDisplayName) {
        try {
            var grProject = new GlideRecordSecure('promin_project');
            grProject.get(projectId);

            var dirtyMessage = '';
            var status = 'warning';

            if (grProject.dirty) {
                dirtyMessage = gs.getMessage("Re-mine the project to apply changes.");
            } else if (grProject.state == 'AVAILABLE' && currentTableDisplayName != 'promin_project') {
                var canWrite = new global.ProminACLUtil(grProject).canWriteInChildTableDef();
                if (canWrite) {
                    dirtyMessage = gs.getMessage("If you wish to change {0} then the existing project versions will be eventually deleted.\nYou need to remine project for recalculation.",
                        currentTableDisplayName);
                }
            }

            return {
                success: true,
                message: dirtyMessage,
                status: status,
            };
        } catch (err) {
            return {
                success: false,
                message: 'Operation failed: get dirty message',
                status: status,
            };
        }
    },

    createProminBreakdown: function(payload) {
        var grBreakdown = new GlideRecordSecure('promin_breakdown_field');
        if (!grBreakdown.canCreate()) {
            return {
                success: false,
                message: 'You do not have permissions to create breakdowns.'
            };
        }
        grBreakdown.initialize();

        for (var key in payload) {
            grBreakdown.setValue(key, payload[key]);
        }

        this._resolveFilterTable(grBreakdown);

        var validationUtil = new sn_po.ProminProjectValidationUtil();
        var validationResponse = validationUtil.validateBreakdownDef(grBreakdown, 'insert');
        if (!validationResponse.success) {
            return validationResponse;
        }

        grBreakdown.insert();

        return {
            success: true,
            message: 'Breakdown created',
        };
    },

    updateProminBreakdown: function(sysId, payload) {
        var grBreakdown = new GlideRecordSecure('promin_breakdown_field');
        if (!grBreakdown.canWrite()) {
            return {
                success: false,
                message: 'You do not have permissions to update this breakdown'
            };
        }

        grBreakdown.get(sysId);

        for (key in payload) {
            grBreakdown.setValue(key, payload[key]);
        }

        this._resolveFilterTable(grBreakdown);

        var validationUtil = new sn_po.ProminProjectValidationUtil();
        var validationResponse = validationUtil.validateBreakdownDef(grBreakdown, 'update');
        if (!validationResponse.success) {
            return validationResponse;
        }

        var id = grBreakdown.update();
        if (gs.nil(id)) {
            return {
                success: false,
                message: gs.getMessage('Breakdown update failed'),
            };
        }

        return {
            success: true,
            message: gs.getMessage('Breakdown updated'),
        };
    },

    // Resolve an empty filter_table from the field's reference target when has_filter is enabled.
    _resolveFilterTable: function(grBreakdown) {
        // 'true' and '1' are treated as enabled; everything else is disabled.
        var hasFilter = grBreakdown.getValue('has_filter');
        var filterEnabled = (hasFilter == 'true' || hasFilter == '1');
        if (!filterEnabled || !gs.nil(grBreakdown.getValue('filter_table'))) {
            return;
        }

        // Dot-walk to the referenced entity's table to resolve the reference target.
        var referenceTable = new sn_po.ProminFindingsDefUtilSNC().getReferenceTableForField(grBreakdown.entity.table, grBreakdown.getValue('field'));
        if (referenceTable) {
            grBreakdown.setValue('filter_table', referenceTable);
        }
    },

    copyProminProject: function(projectId) {
        try {
            var grProject = new GlideRecord('promin_project');

            if (!grProject.get(projectId)) {
                return {
                    success: false,
                    message: gs.getMessage('The project you are trying to copy is not found'),
                    newProjectId: '',
                };
            }

            var canRead = grProject.canRead();
            if (!canRead) {
                return {
                    success: false,
                    message: gs.getMessage('You do not have permission to copy this project'),
                    newProjectId: '',
                };
            }

            if (grProject.canCreate() && !grProject.is_template && gs.nil(grProject.pa_uuid)) {
                var grNewProject = new global.ProminUIAction().copyTableConfig(grProject);
                return {
                    success: true,
                    message: 'Project copied',
                    newProjectId: grNewProject.getUniqueValue(),
                };
            }
            return {
                success: false,
                message: gs.getMessage('You cannot copy this project'),
            };
        } catch (err) {
            return {
                success: false,
                message: err,
                newProjectId: '',
            };
        }
    },

    validateEntityTemplate: function(payload, templateType) {
        var grEntity = new GlideRecordSecure('promin_project_entity');
        if (!grEntity.canCreate()) {
            return {
                success: false,
                message: gs.getMessage('You do not have permissions to create an entity.')
            };
        }

        grEntity.initialize();

        for (var key in payload) {
            grEntity.setValue(key, payload[key]);
        }
        var table = payload['table'];
        if (table) {
            var result = this.isPrimaryEntityValid(table);
            if (!result.success) {
                return {
                    success: false,
                    message: gs.getMessage('Selected table is not valid for mining')
                };
            }
        }

        var validationUtil = new sn_po.ProminProjectValidationUtil();

        var validationResponse = validationUtil.canEntityBeUsedInTemplate(grEntity, templateType);
        if (!validationResponse.success) {
            return validationResponse;
        }
        return {
            success: true,
            message: gs.getMessage('Entity is valid'),
        };
    },

    getUserInfo: function() {
        return {
            success: true,
            userInfo: {
                isSnPoAdmin: gs.hasRole('sn_process_mining_admin'),
                isSnPoPowerUser: gs.hasRole('sn_process_mining_power_user'),
                isSnPoAnalyst: gs.hasRole('sn_process_mining_analyst'),
                isSnAiaViewer: gs.hasRole('sn_aia.viewer')
            }
        };
    },

    _removeDuplicates: function(arr) {
        return arr.filter(function(v, i, self) {
            // It returns the index of the first
            // instance of each value
            return i == self.indexOf(v);
        });
    },

    getProjectPermissions: function(grProject) {
        return new global.ProminACLUtil(grProject).getProjectPermissions();
    },

    getProjectAutoRetiredMessage: function(grProject) {
        return new global.ProminACLUtil(grProject).getProjectAutoRetiredMessage();
    },

    isSharedProject: function(grProject) {
        return {
            'result': new global.ProminACLUtil(grProject).isProjectShared(grProject.getUniqueValue())
        };
    },

    isScopeStageEnabled: function(projectId) {
        try {
            var grProject = new GlideRecord('promin_project');
            if (!grProject.get(projectId)) {
                return {
                    result: false,
                    message: gs.getMessage('Project not found'),
                };
            }

            var isScopeYourAnalysisValid = true;
            var messages = [];

            var useChildTablesAsActivities = Boolean(grProject.is_le_progress);

            var grEntity = new GlideRecord('promin_project_entity');
            grEntity.addQuery('project', projectId);
            grEntity.query();

            while (grEntity.next()) {
                var entityId = grEntity.getUniqueValue();
                var isPrimaryEntity = gs.nil(grEntity.getValue('parent_entity'));

                // For primary entity where `useChildTablesAsActivities` is true,
                // we should ensure that the entity has child entities which can
                // be used as activities
                if (isPrimaryEntity && useChildTablesAsActivities) {
                    var grChildEntities = new GlideRecord('promin_project_entity');
                    grChildEntities.addQuery('parent_entity', entityId);
                    grChildEntities.query();

                    if (grChildEntities.getRowCount() == 0) {
                        isScopeYourAnalysisValid = false;
                        messages.push(gs.getMessage('Parent entity ({0}) should have at least 1 child entity.', [grEntity.getValue('name')]));
                        continue;
                    }
                }

                // When `useChildTablesAsActivities` is false we should ensure that:
                // - Primary entity should have at least 1 activity definition of type DEFAULT
                // - Child entities should have at least 1 activity definition of type DEFAULT or DATE_TIME 
                var grActivity = new GlideRecord('promin_activity_def');
                grActivity.addQuery('entity', entityId);
                grActivity.query();

                var meetsActivityDefCriteria = false;

                while (grActivity.next()) {
                    var activityType = grActivity.getValue('type');

                    if (isPrimaryEntity) {
                        if (activityType == 'DEFAULT') {
                            meetsActivityDefCriteria = true;
                            break;
                        }
                    } else {
                        if (activityType === 'DEFAULT' || activityType == 'DATE_TIME') {
                            meetsActivityDefCriteria = true;
                            break;
                        }
                    }
                }

                if (!meetsActivityDefCriteria) {
                    isScopeYourAnalysisValid = false;
                    if (isPrimaryEntity) {
                        messages.push(gs.getMessage('Primary entity ({0}) must have at least one activity definition of type "Field values (default)', [grEntity.getValue('name')]));
                    } else {
                        messages.push(gs.getMessage('Child entity ({0}) must have at least one activity definition of type "Field values (default) or "Date time"', [grEntity.getValue('name')]));
                    }
                }
            }

            return {
                result: isScopeYourAnalysisValid,
                message: messages.join('. '),
            };
        } catch (err) {
            gs.error('[isScopeStageEnabled] error: ' + err);
            return {
                result: false,
                message: gs.getMessage('Something went wrong while checking if scope your analysis step is valid'),
            };
        }
    },

    getReferenceFieldLabel: function(rootTable, inputField) {
        if (!inputField || !rootTable) {
            return {
                label: '',
                table: rootTable
            };
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

        return {
            label: labels.join(" → "),
            table: table
        };
    },

    getDotwalkFieldPath: function(rootTable, inputField) {
        var fieldPath = [];
        var labels = [];
        var field = '';
        var table = rootTable;
        var fieldList = inputField.split('.');

        if (fieldList.length < 2) {
            var gr = new GlideRecord(table);
            fieldPath.push({
                source: table,
                displayValue: gr.getElement(fieldList[0]).getED().getLabel(),
                internalValue: fieldList[0],
                reference: null,
            });
            return {
                success: true,
                message: 'OK',
                path: fieldPath
            };

        } else {
            for (var i = 0; i < fieldList.length; i++) {
                var gr = new GlideRecord(table);
                if (i === 0) {
                    fieldPath.push({
                        source: table,
                        displayValue: gr.getElement(fieldList[0]).getED().getLabel(),
                        internalValue: fieldList[0],
                        reference: gr.getElement(fieldList[0]).getReferenceTable()
                    });
                }
                labels.push(gr.getElement(fieldList[i]).getED().getLabel());
                if (i == fieldList.length - 1) {
                    break;
                }
                if (gr.getElement([fieldList[i]]).getReferenceTable() != undefined) {
                    table = gr.getElement([fieldList[i]]).getReferenceTable();
                    field = fieldList[i + 1];
                }
                fieldPath.push({
                    source: table,
                    displayValue: '',
                    internalValue: fieldList[i + 1],
                    reference: null
                });
            }
            for (var j = 0; j < fieldPath.length; j++) {
                fieldPath[j].displayValue = labels[j];
            }
        }
        return {
            success: true,
            message: 'OK',
            path: fieldPath
        };
    },
    getDotwalkFieldTable: function(rootTable, inputField) {
        var field = '';
        var table = rootTable;
        var fieldList = inputField.split('.');

        if (fieldList.length < 2) {
            return {
                success: true,
                message: 'OK',
                table: {
                    name: table,
                    label: table,
                },
            };
        } else {
            for (var i = 0; i < fieldList.length - 1; i++) {
                var gr = new GlideRecord(table);
                gr.query();
                if (gr.next() && gr[fieldList[i]].getRefRecord() != undefined && gr[fieldList[i]].getRefRecord().getTableName() != undefined) {
                    table = gr[fieldList[i]].getRefRecord().getTableName();
                    field = fieldList[i + 1];
                }
            }
            return {
                success: true,
                message: 'OK',
                table: {
                    name: table,
                    label: table,
                },
            };
        }
    },
    isSlaBreachVisible: function(tableNames) {
        try {
            var slaTableResult = [];
            var tableNamesArr = tableNames.split(',');
            for (table in tableNamesArr) {
                var entry = {};
                var tables = new GlideTableHierarchy(tableNamesArr[table]).getTables();
                if (tables.includes('task')) {
                    entry['table'] = tableNamesArr[table];
                    entry['visible'] = true;
                    slaTableResult.push(entry);
                } else {
                    entry['table'] = tableNamesArr[table];
                    entry['visible'] = false;
                    slaTableResult.push(entry);
                }
            }

            return {
                'success': true,
                'result': slaTableResult
            };

        } catch (err) {
            return {
                'success': false,
                'result': 'fail'
            };
        }
    },
    createProminSlaBreachEntity: function(payload) {
        var tableName = "task_sla";
        try {
            var params = {
                currentEntityTable: tableName,
                referenceEntityTable: payload.table,
                relationType: "CHILD",
                parentEntitySource: "TABLE",
                childEntitySource: "TABLE",
            };
            var tableRefResponse = this.getProminTablesRefFields(params);
            if (!tableRefResponse.success || tableRefResponse.fields.length == 0) {
                return {
                    success: false,
                    message: gs.getMessage("Could not add Task SLA ({0}) entity", [tableName]),
                };
            }

            entityPayload = {
                project: payload.project,
                name: "Task SLA",
                table: tableName,
                parent_entity: payload.parent_entity,
                relation_type: "CHILD",
                source_field: tableRefResponse.fields[0].name,
                target_field: "sys_id",
                filter: "has_breached=true^sys_created_onISNOTEMPTY^original_breach_timeISNOTEMPTY",
                source_type: "TABLE",
                report_source: null,
                external_dataset: null,
                custom_start_condition: null,
                custom_end_condition: null
            };
            var rec = new GlideRecordSecure('promin_project_entity');
            rec.addEncodedQuery('project.sys_id=' + GlideStringUtil.escapeQueryTermSeparator(payload.project) + '^parent_entity.sys_id=' + GlideStringUtil.escapeQueryTermSeparator(payload.parent_entity) + '^tableLIKE' + tableName + '^relation_type=CHILD', true);
            rec.query();
            var entityId = "";
            while (rec.next()) {
                entityId = rec.getUniqueValue();
            }
            if (entityId == "") {
                var response = this.createProminEntity(entityPayload);
                if (response.success == true) {
                    rec.query();
                    while (rec.next()) {
                        entityId = rec.getUniqueValue();
                    }
                } else {
                    return {
                        success: false,
                        message: response.message || gs.getMessage("Could not add Task SLA ({0}) entity", [tableName]),
                    };
                }
            } else {
                return {
                    success: false,
                    message: gs.getMessage("Task SLA ({0}) entity already exists  for {1} table. Please modify the existing setup if required and mine the project to analyse SLA breaches for {1} records", [tableName, payload.table]),
                };
            }
            var activityPayload = {
                "entity": entityId,
                "display_name": "SLA Breached",
                "type": "DATE_TIME",
                "field": "planned_end_time",
                "activity_of_interest": false,
                "track_change": true,
                "field_display_values": "",
                "field_values": "",
                "choose_values": false,
                "change_name": "SLA Breached",
                "attached_entity": null,
                "include_empty_start_node": false
            };
            var createActivityResponse = this.createProminActivity(activityPayload);
            breakdownFields = ['sla', 'sla.workflow', 'sla.vendor', 'schedule'];
            for (field in breakdownFields) {
                var breakdownPayload = {
                    "entity": entityId,
                    "field": breakdownFields[field],
                    "display_name": breakdownFields[field],
                    "has_filter": false,
                    "filter_table": "",
                    "filter": ""
                };
                var createBreakdownResponse = this.createProminBreakdown(breakdownPayload);
            }
            var errorMsg = "";
            if (createActivityResponse.success == false && createBreakdownResponse.success == false) {
                errorMsg = gs.getMessage("Could not add activities and breakdowns for task SLA ({0}) entity. Please configure them if required and mine the project.", [tableName]);
            } else if (createActivityResponse.success == false) {
                errorMsg = gs.getMessage("Could not add activities for task SLA ({0}) entity. Please configure them if required and mine the project.", [tableName]);
            } else if (createBreakdownResponse.success == false) {
                errorMsg = gs.getMessage("Could not add breakdowns for task SLA ({0}) entity. Please configure them if required and mine the project.", [tableName]);
            }

            if (errorMsg.length > 0) {
                return {
                    success: false,
                    message: errorMsg,
                    entityId: '',
                };
            }
            return {
                success: true,
                message: gs.getMessage("Successfully added Task SLA ({0}) entity. You can now modify the setup if required and mine the project to analyse SLA breaches for {1} records.", [tableName, payload.table]),
                entityId: entityId,
            };
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage("Encountered an error while configuring SLA Analysis for {0} table", payload.table),
                entityId: '',
            };
        }
    },

    includeApprovalAnalysis: function(payload) {
        var childTable = 'sysapproval_approver';
        try {
            var infoMessages = [];
            var projectId = payload.projectId;
            var parentEntityId = payload.parentEntityId;
            var parentTable = payload.table;
            // Step 1 - Check if entity with 'sysapproval_approver' table exists in current project
            var rec = new GlideRecordSecure('promin_project_entity');
            rec.addEncodedQuery('project.sys_id=' + GlideStringUtil.escapeQueryTermSeparator(projectId) + '^parent_entity.sys_id=' + GlideStringUtil.escapeQueryTermSeparator(parentEntityId) + '^tableLIKE' + childTable + '^relation_type=CHILD', true);
            rec.query();
            rec.next();
            if (rec.isValidRecord()) {
                return {
                    success: false,
                    message: gs.getMessage("Approval ({0}) entity already exists for {1} table. Please modify the existing setup if required and mine the project to analyse Approvals for {1} records.", [childTable, parentTable]),
                    infoMessages: infoMessages,
                };
            }

            // Step 2 - Create 'approval' field as AD for parent entity
            // Check if 'approval' field is allowed
            var allowedColumnsResponse = this.getProminAllowedColumnList({
                tableName: parentTable,
                entityId: parentEntityId,
                currentTableName: 'promin_activity_def',
            });
            if (!allowedColumnsResponse.success) {
                return {
                    success: false,
                    message: gs.getMessage("Something went wrong: {0}", [allowedColumnsResponse.message]),
                    infoMessages: infoMessages,
                };
            }
            if (!this._includesField(allowedColumnsResponse.fields, 'approval')) {
                infoMessages.push(gs.getMessage("Approval field does not exist on {0} table.", [parentTable]));
            } else {
                // Create 'approval' field as AD for parent entity
                // Check if 'approval' does not already exist as an AD in parent entity
                if (!this._activityFieldExists('approval', parentEntityId)) {
                    var parentActivityPayload = {
                        entity: parentEntityId,
                        type: "DEFAULT",
                        field: "approval",
                        activity_of_interest: false,
                        track_change: false,
                        field_values_selection_type: "INCLUDE",
                        field_values: "requested,approved,rejected",
                        field_display_values: "Requested,Approved,Rejected",
                        attached_entity: null,
                        include_empty_start_node: false,
                    };
                    var createActivityResponse = this.createProminActivity(parentActivityPayload);
                    if (!createActivityResponse.success) {
                        return {
                            success: false,
                            message: gs.getMessage("Could not add 'approval' field as activity for {0} table: {1}", [payload.table, createActivityResponse.message]),
                            infoMessages: infoMessages,
                        };
                    }
                }
            }
            // Step 3 - Create child entity with 'sysapproval_approver' table
            var childEntityPayload = {
                project: projectId,
                name: "Approval",
                table: childTable,
                parent_entity: parentEntityId,
                relation_type: "CHILD",
                source_field: "document_id",
                target_field: "sys_id",
                filter: "",
                source_type: "TABLE",
                report_source: null,
                external_dataset: null,
                custom_start_condition: null,
                custom_end_condition: null,
            };

            var createEntityResponse = this.createProminEntity(childEntityPayload);
            if (!createEntityResponse.success) {
                return {
                    success: false,
                    message: gs.getMessage("Could not add Approval ({0}) entity", [childTable]),
                    infoMessages: infoMessages,
                };
            }

            // Step 4 - Create 'state' activity for newly created entity
            var childActivityPayload = {
                entity: createEntityResponse.entityId,
                display_name: "",
                type: "DEFAULT",
                field: "state",
                activity_of_interest: false,
                track_change: false,
                field_display_values: "",
                field_values: "",
                choose_values: false,
                change_name: "",
                attached_entity: null,
                include_empty_start_node: false,
            };
            createActivityResponse = this.createProminActivity(childActivityPayload);
            if (!createActivityResponse.success) {
                infoMessages.push(gs.getMessage("Could not add activities for Approval ({0}) entity. Please configure them if required and mine the project.", [childTable]));
            }

            // Step 5 - Create breakdown fields for the newly created entity
            var breakdownFields = ['state', 'group.assignment_group'];
            for (var i = 0; i < breakdownFields.length; i += 1) {
                var breakdownPayload = {
                    "entity": createEntityResponse.entityId,
                    "field": breakdownFields[i],
                    "display_name": "",
                    "has_filter": false,
                    "filter_table": "",
                    "filter": ""
                };
                var createBreakdownResponse = this.createProminBreakdown(breakdownPayload);
                if (!createBreakdownResponse.success) {
                    infoMessages.push(gs.getMessage("Could not add breakdowns for Approval ({0}) entity. Please configure them if required and mine the project.", [childTable]));
                }
            }

            return {
                success: true,
                message: gs.getMessage("Successfully added Approval ({0}) entity. You can now modify the setup if required and mine the project to analyse Approvals for {1} records.", [childTable, parentTable]),
                infoMessages: infoMessages,
                entityId: createEntityResponse.entityId,
            };
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage("Could not add Approval ({0}) entity", [childTable]),
                infoMessages: [],
            };
        }
    },

    _validateActivitiesCount: function(entityId, caller) {
        var gr = new GlideRecordSecure('promin_activity_def');
        gr.addQuery('entity', '=', entityId);
        gr.query();
        var existingDefsCount = gr.getRowCount();
        var validationUtil = new sn_po.ProminProjectValidationUtil();
        var defsLimit = validationUtil.getActivityDefLimits().defaultParentsAllowed;

        var metricsCount = 0;

        var grEntity = new GlideRecordSecure('promin_project_entity');
        grEntity.get(entityId);
        grEntity.query();
        if (grEntity.next()) {
            var fields = grEntity.getValue('touch_point_fields');
            var touchPointsEnabled = grEntity.getValue('enable_touch_point');
            metricsCount = fields && touchPointsEnabled ? fields.split(',').length : 0;
        }

        var overFlowCount = (Number(existingDefsCount) + Number(metricsCount)) - Number(defsLimit);

        var subject = overFlowCount > 0 ? gs.getMessage('activities') : gs.getMessage('activity');

        // message for Including Touch Points Metrics
        if (caller === "touch_points" && overFlowCount >= 0) {
            return gs.getMessage('Failed to add required fields to the project scope. Remove {0} {1} and try again.', [overFlowCount, subject]);
        }

        // message for Activities creation
        if (overFlowCount >= 0) {
            return gs.getMessage('Unable to save activity. Activity limit has been reached. To continue, remove an existing activity or exclude a metric from the project scope.');
        }

        return null;
    },

    includeTouchPointMetrics: function(payload) {
        var tableName = 'promin_project_entity';
        try {
            var newFieldsCount = payload.fields ? payload.fields.split(',').length : 0;
            var newValues = {
                fields: payload.fields,
                timeRange: payload.timeRange,
                users: payload.users
            };
            if (!payload.value) {
                newValues.fields = "";
                newValues.timeRange = "";
                newValues.users = "";
            } else if (payload.value && newFieldsCount > 0) {
                var grActivity = new GlideRecordSecure('promin_activity_def');
                grActivity.initialize();
                grActivity.setValue('entity', payload.entityId);

                // activity defs limit validation
                var validationUtil = new sn_po.ProminProjectValidationUtil();
                var validationResponse = validationUtil.validateActivityDef(grActivity, "insert", newFieldsCount);

                // message for Including Touch Points Metrics
                if (!validationResponse.success) {
                    return {
                        success: false,
                        value: payload.value,
                        message: validationResponse.message
                    };
                }
            }

            var gr = new GlideRecord(tableName);
            if (!gr.canWrite()) {
                return {
                    success: false,
                    value: payload.value,
                    message: gs.getMessage('You do not have permission to update this entity'),
                };
            }
            if (gr.get(payload.entityId)) {
                gr.setValue('enable_touch_point', payload.value);
                gr.setValue('touch_point_fields', newValues.fields);
                gr.setValue('touch_point_time_range', newValues.timeRange);
                gr.setValue('touch_point_excluded_users', newValues.users);
                var id = gr.update();
                if (gs.nil(id)) {
                    return {
                        success: false,
                        value: "",
                        message: gs.getMessage('Entity update failed'),
                    };
                }
            }
            return {
                success: true,
                value: payload.value,
                message: null,
            };
        } catch (error) {
            return {
                success: false,
                value: payload.value,
                message: error
            };
        }
    },

    isApprovalAnalysisVisible: function(table, sourceType) {
        try {
            var params = {
                currentEntityTable: 'sysapproval_approver',
                referenceEntityTable: table,
                relationType: 'CHILD',
                parentEntitySource: sourceType,
                childEntitySource: 'TABLE',
            };
            var refFieldsResponse = this.getProminTablesRefFields(params);
            if (!refFieldsResponse.success) {
                return {
                    success: false,
                    visible: false,
                };
            }
            return {
                success: true,
                visible: this._includesField(refFieldsResponse.fields, 'sysapproval'),
                message: gs.getMessage('Success'),
            };
        } catch (err) {
            return {
                success: false,
                visible: false,
            };
        }
    },

    createMultipleBreakdowns: function(entityId, breakdownFields) {
        var errorMessages = [];
        var breakdownsLimit = 5;
        try {
            // Check if entity is primary
            // Primary entity can have 10 breakdowns. 5 breakdowns for child entities.
            var grEntity = new GlideRecordSecure('promin_project_entity');
            grEntity.get(entityId);
            if (gs.nil(grEntity.parent_entity)) {
                breakdownsLimit = 10;
            }
            var grBreakdowns = new GlideRecord('promin_breakdown_field');
            grBreakdowns.addQuery('entity', entityId);
            grBreakdowns.query();
            if ((grBreakdowns.getRowCount() + breakdownFields.length) > breakdownsLimit) {
                return {
                    success: false,
                    message: gs.getMessage("{0} entity can only have {1} breakdown fields", [grEntity.name, breakdownsLimit.toFixed(0)]),
                };
            }

            for (var i = 0; i < breakdownFields.length; i += 1) {
                var breakdownPayload = {
                    "entity": entityId,
                    "field": breakdownFields[i],
                    "display_name": "",
                    "has_filter": false,
                    "filter_table": "",
                    "filter": ""
                };
                var createBreakdownResponse = this.createProminBreakdown(breakdownPayload);
                if (!createBreakdownResponse.success) {
                    errorMessages.push(gs.getMessage("Could not add breakdown field '{0}': {1}", [this.getReferenceFieldLabel(grEntity.table, breakdownFields[i]).label, createBreakdownResponse.message]));
                }
            }

            var message = '';
            if (breakdownFields.length - errorMessages.length > 0) {
                message = gs.getMessage("Successfully added {0} breakdown field(s)", [(breakdownFields.length - errorMessages.length).toFixed(0)]);
            }

            return {
                success: true,
                message: message,
                errorMessages: errorMessages,
            };
        } catch (err) {
            return {
                success: false,
                message: gs.getMessage("Could not create breakdown fields"),
            };
        }
    },

    _includesField: function(fields, targetField) {
        var idx = fields.findIndex(function(field) {
            return field.name == targetField;
        });

        return idx == -1 ? false : true;
    },

    _activityFieldExists: function(field, entityId) {
        var gr = new GlideRecord('promin_activity_def');
        gr.addQuery('entity', entityId);
        gr.query();

        while (gr.next()) {
            if (gr.getValue('field') == field) {
                return true;
            }
        }

        return false;
    },

    getUseCasesState: function(projectId, entityId) {
        try {
            var TASK_SLA_TABLE = 'task_sla';
            var APPROVALS_TABLE = 'sysapproval_approver';

            var grAllEntities = new GlideRecord('promin_project_entity');
            grAllEntities.addEncodedQuery('project=' + GlideStringUtil.escapeQueryTermSeparator(projectId), true);
            grAllEntities.query();

            var entities = [];

            while (grAllEntities.next()) {
                var includeApprovalsChecked = false;
                var approvalDeps = [];
                var includeSLABreachChecked = false;
                var slaDeps = [];
                var childTables = [];

                // Fetch child tables for current entity
                var grChildTableConfig = new GlideRecord('promin_child_table_config');
                grChildTableConfig.addEncodedQuery('process_def.content_pack=false^process_def.table=' + grAllEntities.getValue('table'));
                grChildTableConfig.query();

                while (grChildTableConfig.next()) {
                    var grChildTable = new GlideRecord(grChildTableConfig.getValue('table'));
                    childTables.push({
                        name: grChildTableConfig.getValue('table'),
                        label: grChildTable.getLabel(),
                        value: false,
                        disabled: false,
                        dependentEntityIds: [],
                    });
                }

                var grEntity = new GlideRecord('promin_project_entity');
                grEntity.addEncodedQuery('project=' + GlideStringUtil.escapeQueryTermSeparator(projectId) + '^parent_entity=' + grAllEntities.getUniqueValue(), true);
                grEntity.query();

                while (grEntity.next()) {
                    // Set Task SLA state
                    if (grEntity.getValue('table') == TASK_SLA_TABLE) {
                        includeSLABreachChecked = true;
                        var grSLADependentEntities = new GlideRecord('promin_project_entity');
                        grSLADependentEntities.addEncodedQuery('project=' + GlideStringUtil.escapeQueryTermSeparator(projectId) + '^parent_entity=' + grEntity.getUniqueValue(), true);
                        grSLADependentEntities.query();
                        while (grSLADependentEntities.next()) {
                            slaDeps.push(grSLADependentEntities.getUniqueValue());
                        }
                    }
                    // Set Approvals state
                    if (grEntity.getValue('table') == APPROVALS_TABLE) {
                        includeApprovalsChecked = true;
                        var grApprovalDependentEntities = new GlideRecord('promin_project_entity');
                        grApprovalDependentEntities.addEncodedQuery('project=' + GlideStringUtil.escapeQueryTermSeparator(projectId) + '^parent_entity=' + grEntity.getUniqueValue(), true);
                        grApprovalDependentEntities.query();
                        while (grApprovalDependentEntities.next()) {
                            approvalDeps.push(grApprovalDependentEntities.getUniqueValue());
                        }
                    }

                    // Set child tables state
                    if (childTables.length > 0) {
                        var foundIndex = childTables.findIndex(function(ct) {
                            return ct.name == grEntity.getValue('table') && grEntity.getValue('relation_type') == 'CHILD';
                        });

                        if (foundIndex != -1) {
                            childTables[foundIndex].value = true;
                            var grChildTableDependentEntities = new GlideRecord('promin_project_entity');
                            grChildTableDependentEntities.addQuery('project=' + projectId + '^parent_entity=' + grEntity.getUniqueValue());
                            grChildTableDependentEntities.query();
                            while (grChildTableDependentEntities.next()) {
                                childTables[foundIndex].dependentEntityIds.push(grChildTableDependentEntities.getUniqueValue());
                            }
                        }
                    }

                    if (includeApprovalsChecked && includeSLABreachChecked && foundIndex != -1) {
                        break;
                    }
                }

                var hierarchyTables = new GlideTableHierarchy(grAllEntities.getValue('table')).getTables();
                var includeApprovalsVisible = false;
                var includeSLABreachVisible = false;

                if (grAllEntities.getValue('source_type') == 'TABLE' || grAllEntities.getValue('source_type') == 'REPORT_SOURCE') {
                    if (grAllEntities.getValue('table') != APPROVALS_TABLE) {
                        includeApprovalsVisible = true;
                    }
                    if (hierarchyTables.includes('task')) {
                        includeSLABreachVisible = true;
                    }
                }

                entities.push({
                    id: grAllEntities.getUniqueValue(),
                    includeApprovals: {
                        value: includeApprovalsChecked,
                        visible: includeApprovalsVisible,
                        disabled: false,
                        dependentEntityIds: approvalDeps,
                    },
                    includeSLABreach: {
                        value: includeSLABreachChecked,
                        visible: includeSLABreachVisible,
                        disabled: false,
                        dependentEntityIds: slaDeps,
                    },
                    childTables: childTables,
                });
            }

            return {
                success: true,
                message: gs.getMessage('OK'),
                entities: entities,
            };
        } catch (err) {
            return {
                success: false,
                message: err,
            };
        }
    },

    createChildTable: function(payload) {
        try {
            var infoMessages = [];
            var projectId = payload.projectId;
            var parentEntityId = payload.parentEntityId;
            var childTable = payload.childTable;

            var grChildTable = new GlideRecord(childTable);
            var childTableLabel = grChildTable.getLabel();

            var grParentEntity = new GlideRecord('promin_project_entity');
            if (!grParentEntity.get(parentEntityId)) {
                return {
                    success: false,
                    errorMessages: [gs.getMessage('Could not find the parent entity')],
                    infoMessages: infoMessages,
                    entityId: '',
                };
            }

            var grChildTableConfig = new GlideRecord('promin_child_table_config');
            grChildTableConfig.addEncodedQuery('process_def.table=' + grParentEntity.getValue('table') + '^table=' + childTable);
            grChildTableConfig.query();

            if (!grChildTableConfig.next()) {
                return {
                    success: false,
                    errorMessages: [gs.getMessage('Could not find child table config for table "{0}"', [childTableLabel])],
                    infoMessages: infoMessages,
                    entityId: '',
                };
            }

            var childEntityPayload = {
                project: projectId,
                name: childTableLabel,
                table: childTable,
                parent_entity: parentEntityId,
                relation_type: "CHILD",
                source_field: grChildTableConfig.getValue('source_field'),
                target_field: grChildTableConfig.getValue('target_field'),
                filter: "",
                source_type: "TABLE",
                report_source: null,
                external_dataset: null,
                custom_start_condition: null,
                custom_end_condition: null,
            };

            var createEntityResponse = this.createProminEntity(childEntityPayload);
            if (!createEntityResponse.success) {
                return {
                    success: false,
                    errorMessages: [gs.getMessage("Could not add child table entity")],
                    infoMessages: infoMessages,
                    entityId: '',
                };
            }

            return {
                success: true,
                infoMessages: [gs.getMessage('Successfully added {0} ({1}) entity', [childTableLabel, childTable])],
                errorMessages: [],
                entityId: createEntityResponse.entityId,
            };
        } catch (err) {
            return {
                success: false,
                errorMessages: [gs.getMessage("Could not add child table entity")],
                infoMessages: [],
                entityId: '',
            };
        }
    },

    getLabels: function(labelsPayload) {
        try {
            var labels = [];
            for (var i = 0; i < labelsPayload.length; i += 1) {
                if (labelsPayload[i].type == 'TABLE') {
                    var gr = new GlideRecord(labelsPayload[i].name);
                    labels.push(gr.getLabel());
                }
            }

            return {
                success: true,
                labels: labels,
            };
        } catch (err) {
            return {
                success: false,
                labels: [],
            }
        }
    },

    getFieldsLabel: function(table, fields) {
        try {
            var result = [];
            for (i = 0; i < fields.length; i++) {
                var response = this.getProminActivityFieldDetails({
                    tableName: table,
                    field: fields[i]
                });

                result.push({
                    id: fields[i],
                    label: response.fieldDetails.label
                });
            }

            return {
                success: true,
                fields: result,
            };
        } catch (err) {
            return {
                success: false,
                fields: [],
            };
        }
    },

    getAutomationDiscoveryIntentsByReportId: function(adReportId) {
        try {
            var intents = [];
            var gr = new GlideRecord('sn_auto_discovery_intent');
            gr.addQuery('report', adReportId);
            gr.query();
            while (gr.next()) {
                intents.push({
                    id: gr.getUniqueValue(),
                    label: gr.getValue('name')
                });
            }

            return {
                success: true,
                intents: intents,
            };
        } catch (err) {
            return {
                success: false,
                intents: [],
            };
        }
    },

    _getProjectTouchPoints: function(entityId) {
        var projectTouchPoints = {
            fields: "",
            timeRange: "",
            users: "",
            enabledForProjects: false
        };
        var gr = new GlideRecord('promin_project_entity');
        gr.get(entityId);
        gr.query();
        if (gr.next()) {
            projectTouchPoints.fields = gr.getValue('touch_point_fields');
            projectTouchPoints.timeRange = gr.getValue('touch_point_time_range');
            projectTouchPoints.users = gr.getValue('touch_point_excluded_users');
            projectTouchPoints.tableName = gr.getValue('table');
            projectTouchPoints.enabledForProjects = gr.getValue('enable_touch_point');
        }
        projectTouchPoints.fields = projectTouchPoints.fields ? projectTouchPoints.fields.split(',') : [];
        projectTouchPoints.users = projectTouchPoints.users ? projectTouchPoints.users.split(',') : [];
        return projectTouchPoints;
    },

    _getProcessTouchPoints: function(processId) {
        var processTouchPoints = {
            fields: [],
            timeRange: null,
            users: []
        };
        if (!processId) {
            return processTouchPoints;
        }
        var gr = new GlideRecord('promin_process_def');
        gr.get(processId);
        gr.query();
        if (gr.next()) {
            processTouchPoints.fields = gr.getValue('touch_point_fields');
            processTouchPoints.timeRange = gr.getValue('touch_point_time_range');
            processTouchPoints.users = gr.getValue('touch_point_excluded_users');
        }
        processTouchPoints.fields = processTouchPoints.fields ? processTouchPoints.fields.split(',') : [];
        processTouchPoints.users = processTouchPoints.users ? processTouchPoints.users.split(',') : [];
        processTouchPoints.timeRange = processTouchPoints.timeRange ? processTouchPoints.timeRange : null;
        return processTouchPoints;
    },

    _findUnmatched: function(projectFields, processFields) {
        var unmatchedProjectFields = projectFields.filter(function(item) {
            return !processFields.includes(item);
        }) || [];
        var unmatchedProcessFields = processFields.filter(function(item) {
            return !projectFields.includes(item);
        }) || [];

        return unmatchedProjectFields.length > 0 || unmatchedProcessFields.length > 0;
    },

    _checkTimeRange: function(projectTimeRange, processTimeRange) {
        return Number(projectTimeRange) !== Number(processTimeRange);
    },

    touchPointsStatus: function(payload) {
        var params = {
            entityId: '',
        };
        var formattedFields = [];
        var allowedColumnsList = [];

        var grPrEn = new GlideRecord('promin_project_entity');
        grPrEn.addQuery('project', payload.projectId);
        grPrEn.query();
        while (grPrEn.next()) {
            var entityId = grPrEn.getUniqueValue();
            var parentEntity = grPrEn.getValue('parent_entity');
            if (parentEntity == null) {
                params.entityId = entityId;
            }
        }

        // get entity touch points
        var projectTouchPoints = this._getProjectTouchPoints(params.entityId);

        // get process config touch points
        var processTouchPoints = this._getProcessTouchPoints(payload.processId);

        var columnsMap = {};
        for (i = 0; i < projectTouchPoints.fields.length; i++) {
            var response = this.getProminActivityFieldDetails({
                tableName: projectTouchPoints.tableName,
                field: projectTouchPoints.fields[i]
            });
            // Create a lookup object for columns for faster access
            columnsMap[projectTouchPoints.fields[i]] = response.fieldDetails;
        }

        // formatted metrics for project
        if (projectTouchPoints.enabledForProjects && Object.keys(columnsMap).length > 0) {
            formattedFields = projectTouchPoints.fields.map(function(pill) {
                var field = columnsMap[pill];
                return {
                    label: field.label,
                    id: pill
                };
            });
        }

        var processFields = [];
        var foundFieldChanges = false;
        var foundUserChanges = false;
        var foundTimeRangeChanges = false;

        foundFieldChanges = this._findUnmatched(projectTouchPoints.fields, processTouchPoints.fields);
        foundUserChanges = this._findUnmatched(projectTouchPoints.users, processTouchPoints.users);
        foundTimeRangeChanges = this._checkTimeRange(projectTouchPoints.timeRange, processTouchPoints.timeRange);

        for (i = 0; i < processTouchPoints.fields.length; i++) {
            var columnResponse = this.getProminActivityFieldDetails({
                tableName: projectTouchPoints.tableName,
                field: processTouchPoints.fields[i]
            });
            // Create a lookup object for columns for faster access
            columnsMap[processTouchPoints.fields[i]] = columnResponse.fieldDetails;
        }

        // if process and project metrics un-matched generate formatted metrics for sync
        if (foundFieldChanges && Object.keys(columnsMap).length > 0) {
            processFields = processTouchPoints.fields.map(function(pill) {
                var field = columnsMap[pill];
                return {
                    label: field.label,
                    id: pill
                };
            });
        }
        // prop status: indicates that Touch Points modified in process config
        // prop newIncomingFields: newly configured formatted fields of Touch Point metrics in process config
        return {
            success: true,
            status: foundFieldChanges || foundUserChanges || foundTimeRangeChanges,
            fields: formattedFields,
            newIncomingFields: processFields
        };
    },

    _getPerspectiveFields: function(payload) {
        try {
            var tableName = '';
            var allowedColumnsList = [];
            var perspectivesFields = [];
            var processFields = [];
            var perspectiveResourceFields = [];
            var blockedTablesMessage = '';

            // get configuration perspective fields
            var grPVFC = new GlideRecordSecure('promin_view_field_config');
            grPVFC.addQuery("process_def", payload.processId);
            grPVFC.query();
            while (grPVFC.next()) {
                tableName = grPVFC.getDisplayValue('process_def');
                var grTable = new GlideRecord(tableName);
                if (grPVFC.getValue('view') == this.perspectivesEnum.RESOURCE_GROUP || grPVFC.getValue('view') == this.perspectivesEnum.RESOURCE_USER) {
                    var value = grPVFC.getValue('field');
                    perspectiveResourceFields.push({
                        field: value,
                        table: grTable.getElement(value).getED().getReference()
                    });
                }
                // filter out OTHER fields, not required for Idle time analysis
                if (grPVFC.getValue('view') != this.perspectivesEnum.OTHER) {
                    perspectivesFields.push({
                        view: grPVFC.getValue('view'),
                        field: grPVFC.getValue('field')
                    });
                }
            }
            var columnsMap = {};
            for (i = 0; i < perspectivesFields.length; i++) {
                var response = this.getProminActivityFieldDetails({
                    tableName: tableName,
                    field: perspectivesFields[i].field
                });
                // Create a lookup object for allowedColumnsList for faster access
                columnsMap[perspectivesFields[i].field] = response.fieldDetails;
            }

            var perspectiveRankings = {
                CONTROL_FLOW: {
                    type: "choice",
                    rank: 0
                },
                RESOURCE_GROUP: {
                    type: "reference",
                    rank: 1
                },
                RESOURCE_USER: {
                    type: "reference",
                    rank: 2
                }
            };

            perspectivesFields.forEach(function(item) {
                var column = columnsMap[item.field];
                if (column) {
                    column.perspectiveType = item.view;
                    column.perspectiveField = item.field;
                    column.isValidSelection = false;
                    column.name = item.field;
                    var perspective = perspectiveRankings[item.view];
                    if (perspective && column.internalType === perspective.type) {
                        column.isValidSelection = true;
                        column.rank = perspective.rank;
                    }

                    processFields.push(column);
                }
            });

            var hasInvalidSelections = processFields.some(function(field) {
                return !field.isValidSelection;
            });

            var prominBlockedTables = gs.getProperty("promin.blocked.tables", '');

            var blockedTablesSet = prominBlockedTables.split(',').map(function(item) {
                return item.trim();
            });

            var blockedTableFields = perspectiveResourceFields
                .filter(function(item) {
                    return blockedTablesSet.includes(item.table);
                })
                .map(function(item) {
                    return columnsMap[item.field];
                });

            if (blockedTableFields.length) {
                blockedTablesMessage = gs.getMessage('Process details contains an entity prohibited to include in a project. Entity field(s): {0}. Change your selection to proceed.', blockedTableFields.map(function(item) {
                    return item.label;
                }).join(', '));
            }
            return {
                isValid: !hasInvalidSelections && processFields.length == 3,
                fields: processFields.sort(function(a, b) {
                    return a.rank - b.rank;
                }),
                message: blockedTablesMessage,
                blockedTableFields: blockedTableFields
            };
        } catch (error) {
            return {
                isValid: false,
                fields: [],
                message: error,
                blockedTableFields: []
            };
        }
    },

    _controlFlowMappings: function(payload) {
        try {
            var mappings = '';
            var grPCFM = new GlideRecordSecure('promin_control_flow_mapping');
            grPCFM.addQuery("process_def", payload.processId);
            grPCFM.addQuery("category", "PROVIDER");
            grPCFM.query();
            if (grPCFM.next()) {
                mappings = grPCFM.getValue('values');
            }
            return mappings;
        } catch (err) {
            return '';
        }
    },

    getActivityDefinitions: function(payload, processADs) {
        try {
            var newValidProcessADsForInsert = [];
            var projectActivityDefinitions = [];
            var grPAD = new GlideRecordSecure('promin_activity_def');
            grPAD.addQuery("entity", payload.entityId);
            grPAD.query();

            while (grPAD.next()) {
                var projectAD = {};

                var isCompoundAD = grPAD.getValue('type') === "COMPOUND";
                var isGroupedAD = grPAD.getValue('track_change') === "1";

                var fields = [grPAD.getValue('field')];

                if (isCompoundAD) {
                    fields = grPAD.getValue('field').split(',');
                }

                var index = processADs.findIndex(function(processAD) {
                    return fields.includes(processAD.name);
                });

                // update process AD with a flag to avoid the duplicates while AD creation
                if (index !== -1) {
                    // ⭐️ if AD is added as grouped or compound, then mark it as invalid record
                    var isInvalidRecord = isGroupedAD || isCompoundAD;
                    // mark processAD as exists in projectADs
                    processADs[index].isExistsInProjectADs = true;

                    projectAD.label = processADs[index].label;
                    projectAD.isExistsInPerspectives = true;
                    projectAD.hasInvalidSelections = isInvalidRecord;
                }

                // prepare a Project AD object
                projectAD.field = grPAD.getValue('field');
                projectAD.type = grPAD.getValue('type');
                projectAD.grouped = grPAD.getValue('track_change') === "1";
                projectAD.aoi = grPAD.getValue('activity_of_interest');
                projectAD.sysId = grPAD.getValue('sys_id');

                // insert into project ADs collection
                projectActivityDefinitions.push(projectAD);
            }
            return {
                projectADs: projectActivityDefinitions,
                processADs: processADs.filter(function(i) {
                    return !i.isExistsInProjectADs;
                })
            };
        } catch (err) {
            return {
                projectADs: [],
                processADs: []
            };
        }
    },

    idleTimeConfiguration: function(payload) {
        try {
            var fieldsAndStatus = this._getIdleTimeConfigurationFields(payload);

            var entityIdleTimeEnabled = this._getEntityIdleTimeStatus(payload);

            var activities = this.getActivityDefinitions(payload, fieldsAndStatus.fields);

            var isOutOfSync = !fieldsAndStatus.isIdleTimeConfigValid || activities.processADs.length > 0;

            var matchedProjectIds = activities.projectADs.filter(
                function(i) {
                    return i.isExistsInPerspectives;
                }).map(
                function(i) {
                    return {
                        sysId: i.sysId,
                        field: i.field
                    };
                });

            return {
                success: true,
                status: isOutOfSync && entityIdleTimeEnabled === "true",
                isIdleTimeConfigValid: fieldsAndStatus.isIdleTimeConfigValid && !fieldsAndStatus.blockedTableFields.length,
                fields: fieldsAndStatus.fields,
                projectActivityDefinitions: matchedProjectIds,
                message: fieldsAndStatus.message
            };
        } catch (error) {
            return {
                success: false,
                status: false,
                isIdleTimeConfigValid: false,
                fields: [],
                projectActivityDefinitions: [],
                message: null
            };
        }
    },

    _getIdleTimeConfigurationFields: function(payload) {

        var perspectiveFields = this._getPerspectiveFields(payload);

        var controlFlowMappings = this._controlFlowMappings(payload);

        return {
            isIdleTimeConfigValid: perspectiveFields.isValid && controlFlowMappings.length > 0,
            fields: perspectiveFields.fields,
            message: perspectiveFields.message,
            blockedTableFields: perspectiveFields.blockedTableFields
        };
    },

    _getEntityIdleTimeStatus: function(payload) {
        try {
            var idleTimeStatus = false;
            var grPPE = new GlideRecord('promin_project_entity');
            grPPE.get(payload.entityId);
            grPPE.query();
            if (grPPE.next()) {
                idleTimeStatus = grPPE.getDisplayValue('enable_idle_time');
            }
            return idleTimeStatus;
        } catch (error) {
            return false;
        }
    },

    _validateActivitiesForIdleTime: function(activities, payload) {
        try {
            var touchPointsEnabled = 0;
            var gr = new GlideRecord("promin_project_entity");
            gr.get(payload.entityId);
            gr.query();
            if (gr.next()) {
                touchPointsEnabled = Number(gr.getValue("enable_touch_point"));
            }

            var defsLimit = gs.getProperty("promin.limit.total_activity", 10);
            var projectADs = activities.projectADs;
            var processFields = 3;
            var processADs = activities.processADs;

            var count = (projectADs.length + processADs.length + touchPointsEnabled) - 10;
            if (count > 0) {
                var subject = count > 1 ? gs.getMessage('activities') : gs.getMessage('activity');
                var extraMetricsMsg = touchPointsEnabled && count == 1 ? gs.getMessage("or exclude a metric from the project scope.") : gs.getMessage("and try again.");
                return {
                    success: false,
                    message: gs.getMessage('Failed to add required activities to the project scope. Remove {0} {1} {2}', [count.toString(), subject, extraMetricsMsg])
                };
            }

            var projectDefaultADs = projectADs.filter(function(item) {
                return item.type == "DEFAULT" && item.aoi == false;
            });
            var processDefaultADsCount = 0;
            if (activities.processADs.length !== 3) {
                activities.processADs.map(function(item) {
                    if (item.perspectiveType == "RESOURCE_GROUP" || item.perspectiveType == "CONTROL_FLOW") {
                        processDefaultADsCount = processDefaultADsCount + 1;
                    }
                });
            } else {
                // Resource team is of type default and AOI
                processDefaultADsCount = 2;
            }

            var defaultsLimit = gs.getProperty("promin.limit.default_activity", 5);

            var grActivity = new GlideRecordSecure('promin_activity_def');

            var overFlowADsCount = (Number(projectADs.length) + Number(processFields)) - Number(defsLimit);

            var defaultADsCount = projectDefaultADs.length + processDefaultADsCount;

            if (defaultADsCount > defaultsLimit) {
                var defaultOverflowCount = Number(defaultADsCount) - Number(defaultsLimit);
                return {
                    success: false,
                    message: gs.getMessage("Failed to add required activities to the project scope. Remove {0} activity(ies) of Default type and try again.", [Number(defaultOverflowCount).toFixed(0)])
                };
            }
            return {
                success: true,
                message: ""
            };
        } catch (error) {
            return {
                success: false,
                message: gs.getMessage("failed when validating the activities for idle time.")
            };
        }
    },

    includeIdleTimeForProject: function(payload) {
        try {
            var returnMessage = '';
            if (!payload.value) {
                return this._updateIdleTimeEntityFlag(payload);
            }
            // process config Idle time
            var fieldsAndStatus = this._getIdleTimeConfigurationFields(payload);

            if (fieldsAndStatus.blockedTableFields.length && fieldsAndStatus.message) {
                throw ({
                    message: fieldsAndStatus.message
                });
            }

            var activities = this.getActivityDefinitions(payload, fieldsAndStatus.fields);

            if (fieldsAndStatus.isIdleTimeConfigValid) {
                if (activities.projectADs.length === 0) {
                    // proceed for Idle Time Fields insertion
                    for (var index in fieldsAndStatus.fields) {
                        this._insertActivityDefinition(fieldsAndStatus.fields[index], payload.entityId);
                    }
                    returnMessage = gs.getMessage('{0} activities added to the project scope.', fieldsAndStatus.fields.length.toString());
                } else {
                    // filter the invalid selection definitions and duplicates
                    var projectInvalidADs = activities.projectADs.reduce(function(acc, field) {
                        if (!acc.includes(field.label) && field.hasInvalidSelections) {
                            acc.push(field.label);
                        }
                        return acc;
                    }, []);

                    if (projectInvalidADs.length > 0) {
                        var violationADs = projectInvalidADs.join(", ");

                        var messageHelpers = projectInvalidADs.length > 1 ? [gs.getMessage("are"), gs.getMessage("activities")] : [gs.getMessage("is"), gs.getMessage("activity")];

                        throw ({
                            message: gs.getMessage("{0} {1} set as compound or grouped {2}. Change the activity type and try again.", [violationADs, messageHelpers[0], messageHelpers[1]])
                        });
                    }

                    // activity defs limit validation
                    var validationResponse = this._validateActivitiesForIdleTime(activities, payload);

                    if (!validationResponse.success) {
                        throw ({
                            message: validationResponse.message
                        });
                    }

                    // proceed for insertion - no violations
                    if (!projectInvalidADs.length && activities.processADs.length > 0) {
                        for (var idx in activities.processADs) {
                            this._insertActivityDefinition(activities.processADs[idx], payload.entityId);
                        }
                    }
                    var countHelper = activities.processADs.length > 1 ?
                        gs.getMessage('activities') : gs.getMessage('activity');

                    returnMessage = gs.getMessage('{0} {1} added to the project scope.', [activities.
                        processADs.length.toString(), countHelper
                    ]);

                    if (activities.processADs.length === 0) {
                        returnMessage = '';
                    }
                }
            }
            // finally update idle time switch position for entity
            return this._updateIdleTimeEntityFlag(payload, returnMessage);

        } catch (error) {
            return {
                success: false,
                value: payload.value,
                message: error.message || error,
            };
        }
    },

    validateADsWithIdleTimeFields: function(projectADs, processADs) {
        try {
            var projectActivityDefinitions = [];
            var grPAD = new GlideRecord('promin_activity_def');
            grPAD.addQuery("entity", payload.entityId);
            grPAD.query();

            while (grPAD.next()) {
                var isValidRecord = processADs.some(function(activity) {
                    return activity.name === grPAD.getValue('field') && grPAD.getValue('track_change') !== "1";
                });
                projectActivityDefinitions.push({
                    field: grPAD.getValue('field'),
                    type: grPAD.getValue('type'), // DEFAULT or DATE_TIME or COMPOUND
                    grouped: grPAD.getValue('track_change') === "1",
                    aoi: grPAD.getValue('activity_of_interest'),
                    isValidRecord: isValidRecord
                });
            }
            return projectActivityDefinitions;
        } catch (err) {
            return [];
        }
    },

    _insertActivityDefinition: function(field, entityId) {
        var activityTypeEnum = {
            DEFAULT: "DEFAULT",
        };
        var activityPayload = {
            "entity": entityId,
            "display_name": field.label,
            "type": activityTypeEnum.DEFAULT,
            "field": field.name,
            "activity_of_interest": field.perspectiveType === this.perspectivesEnum.RESOURCE_USER,
            "track_change": false,
            "field_display_values": "",
            "field_values": "",
            "choose_values": false,
            "change_name": field.label,
            "attached_entity": null,
            "include_empty_start_node": false
        };
        return this.createProminActivity(activityPayload);
    },

    _updateIdleTimeEntityFlag: function(payload, returnMessage) {
        try {
            var tableName = "promin_project_entity";
            var gr = new GlideRecordSecure(tableName);
            gr.get(payload.entityId);
            gr.setValue('enable_idle_time', payload.value);
            var id = gr.update();
            if (gs.nil(id)) {
                gs.error('Error updating entity idle time flag');
            }

            return {
                success: true,
                value: payload.value,
                message: returnMessage || '',
            };
        } catch (error) {
            return {
                success: false,
                value: payload.value,
                message: error,
            };
        }
    },

    isPlaybookProject: function(versionId, projectId) {
        try {
            if (versionId) {
                var projectVersion = new GlideRecordSecure('promin_model_def_version');
                projectVersion.get(versionId);
                var prjId = projectVersion.getValue("project");
                return this._getPlaybookSourceTypeStatus(prjId);
            } else if (projectId) {
                return this._getPlaybookSourceTypeStatus(projectId);
            }
            return {
                status: false
            };
        } catch (error) {
            return {
                status: false
            };
        }
    },
    _getPlaybookSourceTypeStatus: function(projectId) {
        try {
            var projectEntities = new GlideRecord('promin_project_entity');
            projectEntities.addQuery('source_type', "PLAYBOOK_DATA");
            projectEntities.addQuery('project', projectId);
            projectEntities.query();
            return {
                status: projectEntities.hasNext()
            };
        } catch (error) {
            return {
                status: false
            };
        }
    },
    type: 'ProminProjectDefUtilSNC'
};
