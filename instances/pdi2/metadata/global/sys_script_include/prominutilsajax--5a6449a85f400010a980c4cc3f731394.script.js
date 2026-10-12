var ProminUtilsAJAX = Class.create();
ProminUtilsAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getRelatedProcessConfigList: function() {
        var entityTable = this.getParameter("sysparm_entityTable");
        var grProcessConfig = new GlideRecordSecure('promin_process_def');
        grProcessConfig.addQuery("table", entityTable);
        grProcessConfig.addQuery("content_pack", false);
        grProcessConfig.query();
        if (grProcessConfig.next()) {
            return '/' + grProcessConfig.getLink();
        } else {
            return '/' + grProcessConfig.getTableName() + "_list.do";
        }
    },
    isReferenceField: function() {
        var referenceField = this.getParameter('sysparm_referenceField');
        var entityTable = this.getParameter('sysparm_modelDefTable');
        var gr = new GlideRecord(entityTable);
        var field = gr.getElement(referenceField);
        var ed = field.getED();
        var type = ed.getInternalType();
        if (type == 'reference' || type == 'glide_list') {
            return true;
        }
        return '';
    },
    getExecutionIdByProjectDef: function() { // used in ui policy
        var versionTable = "promin_model_def_version";
        var projectDefId = this.getParameter('sysparm_projectDefId');
        if (gs.nil(projectDefId))
            return;
        var grVersion = new GlideRecordSecure(versionTable);
        grVersion.addQuery('project', projectDefId);
        grVersion.setLimit(1);
        grVersion.orderByDesc('sys_updated_on');
        grVersion.query();
        if (!grVersion.next())
            return;
        var response = {
            "versionId": grVersion.getUniqueValue(),
            "executionId": grVersion.getValue('tracker')
        };
        return JSON.stringify(response);
    },
    getReferenceTable: function() {
        var referenceField = this.getParameter('sysparm_referenceField');
        var entityTable = this.getParameter('sysparm_modelDefTable');
        if (gs.nil(entityTable) || gs.nil(referenceField)) {
            return;
        }
        var ed = new GlideRecord(entityTable).getElement(referenceField).getED();
        return (ed.getInternalType() == 'reference' || ed.getInternalType() == 'glide_list') ? ed.getReference() : null;
    },
    getExecutionIdByVersion: function(versionId) { //used in 
        if (gs.nil(versionId)) {
            versionId = this.getParameter('sysparm_versionId');
        }
        if (gs.nil(versionId))
            return;

        var grVersion = new GlideRecordSecure("promin_model_def_version");
        if (!grVersion.get(versionId))
            return;

        return grVersion.getValue('tracker');
    },

    getMessageForDirtyFlagTrue: function() {
        return gs.getMessage("The project needs to be mined again because you added or updated a field value. Click Mine Project to see your updated process map.");
    },

    showMessageWhenDirtyFlagIsFalse: function(grChildTableDefinition) {
        var grProject = grChildTableDefinition.entity.project.getRefRecord();

        var canWrite = new global.ProminACLUtil(grProject).canWriteInChildTableDef();
        if (canWrite) {
            var displayMessage = gs.getMessage("If you wish to change {0} then the existing project versions will be eventually deleted.\nYou need to click 'Mine Project' again for recalculation.", grChildTableDefinition.getClassDisplayValue());

            gs.addInfoMessage(displayMessage);
        }
    },

    getWorkBenchUrl: function(projectDefId) {
        if (gs.nil(projectDefId)) {
            projectDefId = this.getParameter('sysparm_projectDefID');
        }
        var grProminTable = new GlideRecordSecure("promin_model_def_version");
        grProminTable.addQuery('project', projectDefId);
        grProminTable.orderByDesc('sys_created_on');
        grProminTable.setLimit(1);
        grProminTable.query();
        if (grProminTable.next() && grProminTable.getValue('state') == 'AVAILABLE') {
            return this._getGotoWorkbenchURL(grProminTable.getUniqueValue());
        } else {
            return this._getGotoWorkbenchURL();
        }
    },
    getGotoWorkbenchURLforVersion: function(versionId) {
        if (gs.nil(versionId)) {
            versionId = this.getParameter('sysparm_versionId');
        }
        return this._getGotoWorkbenchURL(versionId);
    },
    getActivityOfInterestList: function() {
        var tableConfigSysId = this.getParameter('sysparm_tableConfigSysId');
        var fieldList = [];
        var grEntity = new GlideRecord("promin_activity_def");
        grEntity.addQuery("entity", tableConfigSysId);
        grEntity.addQuery("activity_of_interest", true);
        grEntity.query();
        while (grEntity.next()) {
            fieldList.push(grEntity.getValue("field"));
        }
        return fieldList.toString();
    },
    getProcessDefTable: function() {
        var findingDefSysId = this.getParameter('sysparm_findingDefSysId') || "";
        var grFindingDef = new GlideRecordSecure("promin_finding_def");
        if (!grFindingDef.get(findingDefSysId)) {
            return;
        }
        return grFindingDef.process_def.table;
    },
    _getGotoWorkbenchURL: function(versionId) {
        var workbenchURL = '/now/experience/promin/'; //default URL
        if (versionId && !gs.nil(versionId)) {
            workbenchURL += 'process-details/' + versionId;
        }
        return workbenchURL;
    },
    _hasTableData: function(table, query) {
        var grProminData = new GlideRecordSecure(table);
        grProminData.addEncodedQuery(query);
        grProminData.query();
        return grProminData.hasNext();
    },

    cancelMining: function() {
        var versionId = this.getParameter('sysparm_versionId');
        if (!gs.nil(versionId))
            SNC.ProcessOptimization.cancelMining(versionId);
    },
    addUserToWatchList: function() {
        var projectDefId = this.getParameter('sysparm_projectDefId');
        var grProjectDef = new GlideRecordSecure('promin_project');
        if (grProjectDef.get(projectDefId)) {
            var userId = gs.getUserID();
            var watchList = grProjectDef.watch_list.toString().split(',');
            if (watchList.indexOf(userId) < 0) {
                watchList.push(userId);
                grProjectDef.watch_list = watchList.toString();
                var id = grProjectDef.update();
                if (gs.nil(id)) {
                    return false;
                }
                return true;
            }
        }
        return false;
    },
    canConfigureLinkProcess: function(modelDefId) { //TODO: remove
        return false;
    },
    createModelDefFromList: function() {
        var table = this.getParameter('sysparm_table');
        var encodedQuery = this.getParameter('sysparm_query');
        return SNC.ProcessOptimization.createModelDefFromList(table, encodedQuery);
    },
    /*
    	Used in finding condition to hide unsupported predicate (contains, does not contains, starts/ends with)
    */
    isStringField: function() {
        var field = this.getParameter('sysparm_field') || '';
        var table = this.getParameter('sysparm_table') || '';
        if (gs.nil(table) || gs.nil(field)) {
            return;
        }
        var gr = new GlideRecord(table);
        var geField = gr.getElement(field);
        var ed = geField.getED();
        var type = ed.getInternalType();

        if (type == 'string' && gr[field].getChoices().toString() == '[]') {
            return true;
        }
        return false;
    },
    /* 
    This sets the value of deleted column to true for selected projects from the list
    */
    markProjectsForDeletion: function() {
        var objSysIds = this.getParameter('sysparm_obj_list') || "";
        if (gs.nil(objSysIds)) {
            return;
        }
        var objList = objSysIds.split(',');
        if (objList.length > 0) {
            var grProject = new GlideRecord("promin_project");
            if (!grProject.canWrite()) {
                return false;
            }
            grProject.addQuery('sys_id', 'IN', objSysIds);
            grProject.query();
            while (grProject.next() && grProject.canDelete()) {
                grProject.deleted = true;
                var id = grProject.update();
                if (gs.nil(id)) {
                    return false;
                }
            }
        }
        return true;
    },
    getDateTimeFieldList: function() {
        var allTables = '';
        var dateTimeFields = [];
        var tableName = this.getParameter('sysparm_tableName');
        allTables += new TableUtils(tableName).getTables().toString();
        if (allTables) {
            var grDictionary = new GlideRecord('sys_dictionary');
            grDictionary.addQuery('name', 'IN', allTables.replace(/[\][]/g, '').replace(/ +?/g, ''));
            grDictionary.addQuery('internal_type', 'IN', 'glide_date_time');
            grDictionary.query();
            while (grDictionary.next()) {
                dateTimeFields.push(grDictionary.getValue('element'));
            }
        }
        return dateTimeFields.toString();
    },

    getLabelForSelectedField: function() {
        var selectedField = this.getParameter('sysparm_selectedField') || '';
        var tableName = this.getParameter('sysparm_tableName') || '';
        var selectedFieldLabel = [];
        var response = {};

        var gr = new GlideRecord(tableName);
        selectedFieldLabel.push(gr.getElement(selectedField).getLabel());
        response["selected_field"] = selectedFieldLabel;

        return JSON.stringify(response);
    },

    isValidFieldForFinding: function() {
        var tableConfigSysId = this.getParameter('sysparm_entityId');
        var selectedField = this.getParameter('sysparm_selectedField') || '';
        var tableName = this.getParameter('sysparm_tableName') || '';
        var type = this.getParameter('sysparm_conditionType') || '';
        var gaActivityDef = new GlideRecordSecure("promin_activity_def");
        gaActivityDef.addQuery("entity", tableConfigSysId);
        gaActivityDef.query();
        var isValidField = false;
        var isActivityDefRecordPresent = false;
        var isNotValidForFieldValueConditions = false;
        while (gaActivityDef.next()) {
            isActivityDefRecordPresent = true;
            if (gaActivityDef.getValue("field") == selectedField) {
                isValidField = true;
                var isAoi = Boolean(parseInt(gaActivityDef.getValue("activity_of_interest")));
                //Field value conditions should be based on non AOI fields
                if (type == "PROPERTY" && isAoi) {
                    isNotValidForFieldValueConditions = true;
                }
            }
        }
        var tableLabel = '';
        if (!gs.nil(tableName)) {
            var gr = new GlideRecord(tableName);
            tableLabel = gr.getLabel();
        }
        var gaProject = new GlideAggregate("promin_project_entity");
        gaProject.addQuery('sys_id', tableConfigSysId);
        gaProject.query();
        if (gaProject.hasNext() && isValidField && isNotValidForFieldValueConditions) {
            isValidField = false;
            var error_message = gs.getMessage("Selected field is added as contextual activity in `{0}` table configuration and can only be used in Contextual field/value conditions.", [tableLabel]);
        } else if (!isValidField && gaProject.hasNext() & isActivityDefRecordPresent) {
            gaProject.next();
            var link = '<a href="' + gaProject.getLink() + '" target="_blank">Click here</a>';
            var error_message = gs.getMessage("Selected field is not from one of the Activity definitions configured for the table. Please {0} to view existing activity definitions for '{1}' table", [link, tableLabel]);
        } else if (!isValidField && !gaProject.hasNext() && !isActivityDefRecordPresent) {
            var error_message = gs.getMessage("There are no activity definitions present for the '{0}' table. Please create them to configure the condition based on the activity's field.", tableLabel);
        }
        var response = {};
        response["isValid"] = isValidField;
        response["errorMessage"] = error_message;

        return JSON.stringify(response);
    },
    getLabelForCompoundActivityField: function() {
        var compoundFields = this.getParameter('sysparm_compoundFields') || '';
        var tableName = this.getParameter('sysparm_tableName') || '';
        var selecetdFieldLabels = [];
        var gr = new GlideRecord(tableName);
        compoundFields.split(",").forEach(field => {
            selecetdFieldLabels.push(gr.getElement(field).getLabel());
        });

        return JSON.stringify({
            "compoundActivityLabel": selecetdFieldLabels.join()
        })

    },
    isNonChoiceIntegerField: function() {
        var table = this.getParameter('sysparm_table') || '';
        var fieldName = '' + this.getParameter('sysparm_field');
        var selectedField = '';
        if (gs.nil(table) || gs.nil(fieldName)) {
            return;
        }
        if (fieldName.includes('.')) {
            selectedField = fieldName.split(".");
        }
        var totalLength = selectedField.length - 1;
        if (selectedField.length >= 2) {
            for (var count = 0; count < totalLength; count++) {
                var tableGr = new GlideRecord(table);
                tableGr.query();
                if (tableGr.next() && tableGr[selectedField[count]].getRefRecord().getTableName() !== 'undefined') {
                    table = tableGr[selectedField[count]].getRefRecord().getTableName();
                    fieldName = selectedField[count + 1];
                }
            }
        }
        var glideRecord = new GlideRecord(table);
        var geField = glideRecord.getElement(fieldName);
        var ed = geField.getED();
        var type = ed.getInternalType();
        if (type == 'integer' && glideRecord[fieldName].getChoices().toString() == '[]') {
            return true;
        }
        return false;
    },
    getTaskMiningProjectDetails: function(trackerId) {
        try {
            var responseJson = SNC.ProcessOptimization.getTaskMiningProjectDetails(trackerId);
            var response = JSON.parse(responseJson);
            if (response.status == "success") {
                return response;
            } else if (response.status == "error") {
                throw response.errorMessage;
            } else {
                gs.getMessage("Error while getting Task Mining project details")
            }
        } catch (error) {
            throw error.message;
        }
    },

    updateTaskMiningProjectId: function(usersCollectorTaskIdentifier, taskMiningProjectId) {
        try {
            SNC.ProcessOptimization.updateTaskMiningProjectId(usersCollectorTaskIdentifier, taskMiningProjectId);
        } catch (error) {
            throw error.message;
        }
    },

    type: 'ProminUtilsAJAX'
});
