var ProminUIActionSNC = Class.create();
ProminUIActionSNC.prototype = {
    initialize: function() {
        this.WORKBENCH_UI_ACTION_SYSID = {
            "promin_project": "54fe5fbb6b1101104e6fe1188e44afe8",
            "promin_model_def_version": "a38ecc845365301025a7ddeeff7b12b1"
        };
    },
    showImportProcessFindingTemplates: function(grProject) {
        return grProject.canWrite() && new global.ProminACLUtil(grProject).canWriteInChildTableDef();
    },
    isVersionPresent: function(grProjectDef) {
        var gaVersion = new GlideAggregate('promin_model_def_version');
        gaVersion.addQuery("project", grProjectDef.getUniqueValue());
        gaVersion.addQuery("state", "AVAILABLE");
        gaVersion.addAggregate('COUNT');
        gaVersion.query();
        return gaVersion.next() && gaVersion.getAggregate('COUNT') > 0;
    },
    getWorkbenchUIactionSysIdForVersion: function() {
        return this.WORKBENCH_UI_ACTION_SYSID.promin_model_def_version;
    },
    getWorkbenchUIactionSysIdForModelDef: function() {
        return this.WORKBENCH_UI_ACTION_SYSID.promin_project;
    },
    copyTableConfig: function(grProject) {
        var oldAndNewTableConfig = {};
        grProject.number = "";
        grProject.content_pack = false;
        grProject.source = "MANUAL";
        grProject.name = "Copy of " + grProject.name;
        grProject.locked_by = "";
        grProject.status = "DRAFT";

        var projectDefId = grProject.getUniqueValue();
        var entityInfo = this._getParentTableConfigInfo(projectDefId);
        var newProjectId = grProject.insert();
        var oldAndNewAdvancedCondition = {};

        var cloneEntityRelatedTableData = [{
            "table": "promin_activity_def",
            "field": "entity"
        }, {
            "table": "promin_breakdown_field",
            "field": "entity"
        }];

        var grEntity = new GlideRecord("promin_project_entity");
        grEntity.addQuery("project", projectDefId);
        grEntity.orderBy("parent_entity");
        grEntity.query();
        while (grEntity.next()) {
            var entityId = grEntity.getUniqueValue();
            if (!gs.nil(entityInfo[entityId].newEntityId)) {
                grEntity.setNewGuidValue(entityInfo[entityId].newEntityId);
            }
            if (!gs.nil(grEntity.parent_entity)) {
                grEntity.setValue("parent_entity", entityInfo[entityId].newParentEntityId);
            }

            grEntity["project"] = newProjectId;
            grEntity.setWorkflow(false);
            var newEntityId = grEntity.insert();
            oldAndNewTableConfig[entityId] = newEntityId;
        }

        for (var entitySysId in oldAndNewTableConfig) {
            if (!gs.nil(entityInfo[entitySysId].customStart) || !gs.nil(entityInfo[entitySysId].customEnd)) {
                var newEntitySysId = oldAndNewTableConfig[entitySysId];
                oldAndNewAdvancedCondition = this._duplicateFindingDefCondAndGetConfig(entitySysId, newEntitySysId, "entity");
                var grEntityNew = new GlideRecord("promin_project_entity");
                grEntityNew.addQuery("sys_id", newEntitySysId);
                grEntityNew.query();
                if (grEntityNew.next()) {
                    if (!gs.nil(entityInfo[entitySysId].customStart)) {
                        grEntityNew["custom_start_condition"] = oldAndNewAdvancedCondition[entityInfo[entitySysId].customStart];
                    }
                    if (!gs.nil(entityInfo[entitySysId].customEnd)) {
                        grEntityNew["custom_end_condition"] = oldAndNewAdvancedCondition[entityInfo[entitySysId].customEnd];
                    }
                    grEntityNew.setWorkflow(false);
                    grEntityNew.update();
                }
            }
        }
        for (var entity in oldAndNewTableConfig) {
            entityId = entity;
            newEntityId = oldAndNewTableConfig[entity];
            for (var tableCnt = 0; tableCnt < cloneEntityRelatedTableData.length; tableCnt++) {
                var cloneTable = cloneEntityRelatedTableData[tableCnt].table;
                var refField = cloneEntityRelatedTableData[tableCnt].field;
                var grTable = new GlideRecord(cloneTable);
                grTable.addQuery(refField, entityId);
                grTable.query();
                while (grTable.next()) {
                    grTable[refField] = newEntityId;
                    if (cloneTable == "promin_activity_def" && !gs.nil(grTable["attached_entity"]) &&
                        !gs.nil(oldAndNewTableConfig[grTable["attached_entity"]])) {
                        grTable.attached_entity = oldAndNewTableConfig[grTable["attached_entity"]];
                    }
                    var newId = grTable.insert();
					if(gs.nil(newId)) {
						throw gs.getMessage("Failed to copy related data for the project");
					}
                }
            }
        }

        // copy rule finding defs
        var grFindingDef = new GlideRecord("promin_finding_def");
        grFindingDef.addQuery("project", projectDefId);
        grFindingDef.query();
        while (grFindingDef.next()) {
            grFindingDef.project = newProjectId;
            var oldFindingDefId = grFindingDef.getUniqueValue();
            grFindingDef.setWorkflow(false);
            var newFindingDefId = grFindingDef.insert();
            this._copyFindingCondition(oldFindingDefId, newFindingDefId);

            var oldAndNewEntity = {};
            var grCondition = new GlideRecord("promin_finding_def_condition");
            grCondition.addQuery("finding_def", oldFindingDefId);
            grCondition.query();
            while (grCondition.next()) {
                var oldEntitySysId = grCondition["entity"];
                var copiedEntitySysId = oldAndNewTableConfig[oldEntitySysId];
                oldAndNewEntity[oldEntitySysId] = copiedEntitySysId;
            }
            var grCondNew = new GlideRecord("promin_finding_def_condition");
            grCondNew.addQuery("finding_def", newFindingDefId);
            grCondNew.query();
            while (grCondNew.next()) {
                grCondNew["entity"] = oldAndNewEntity[grCondNew["entity"]];
                grCondNew.setWorkflow(false);
                grCondNew.update();
            }
        }

        // copy automated finding defs
        var grAutomatedDef = new GlideRecord("promin_automated_finding");
        grAutomatedDef.addQuery("project", projectDefId);
        grAutomatedDef.query();
        while (grAutomatedDef.next()) {
            grAutomatedDef.project = newProjectId;
            var oldAutomatedDefId = grAutomatedDef.getUniqueValue();
            grAutomatedDef.setWorkflow(false);
            var newAutomatedDefId = grAutomatedDef.insert();

            var grAutomatedConfig = new GlideRecord("promin_automated_finding_configuration");
            grAutomatedConfig.addQuery('automated_finding', oldAutomatedDefId);
            grAutomatedConfig.query();

            while (grAutomatedConfig.next()) {
                grAutomatedConfig.automated_finding = newAutomatedDefId;
                grAutomatedConfig.setWorkflow(false);
                grAutomatedConfig.insert();
            }

        }

        return grProject;
    },
    _getParentTableConfigInfo: function(projectDefId) {
        var entityInfo = {};
        var grEntity = new GlideRecord("promin_project_entity");
        grEntity.addQuery("project", projectDefId);
        grEntity.query();
        while (grEntity.next()) {
            var parentEntity = grEntity.getValue("parent_entity") || "";
            entityInfo[grEntity.getUniqueValue()] = {
                "newEntityId": gs.generateGUID(),
                "parentEntityId": parentEntity,
                "newParentEntityId": "",
                "customStart": grEntity.getValue("custom_start_condition") || "",
                "customEnd": grEntity.getValue("custom_end_condition") || ""
            };
        }

        for (var entitySysId in entityInfo) {
            if (entityInfo[entitySysId].parentEntityId != "") {
                entityInfo[entitySysId].newParentEntityId = entityInfo[entityInfo[entitySysId].parentEntityId].newEntityId;
            }
        }
        return entityInfo;
    },

    copyFindingConfig: function(grFinding) {
        grFinding.message = "Copy of " + grFinding.message;
        grFinding.content_pack = false;
        grFinding.copied_from = "";
        grFinding.setWorkflow(false);
        var oldFindingDefId = grFinding.getUniqueValue();
        var newFindingDefId = grFinding.insert();
        this._copyFindingCondition(oldFindingDefId, newFindingDefId);
        return grFinding;
    },

    _copyFindingCondition: function(oldFindingDefId, newFindingDefId) {
        var oldAndNewFindingDefCondition = this._duplicateFindingDefCondAndGetConfig(oldFindingDefId, newFindingDefId, "finding_def");
		var oldAndNewFindingChain = this._duplicateFindingChain(oldFindingDefId, newFindingDefId);

        var cloneTablesData = [{
            "table": "promin_finding_def_rule",
            "field": "finding_def"
        }, {
            "table": "promin_finding_def_constraint",
            "field": "finding_def"
        }];

        for (var count = 0; count < cloneTablesData.length; count++) {
            var cloneTable = cloneTablesData[count].table;
            var refField = cloneTablesData[count].field;
            var grTable = new GlideRecord(cloneTable);
            grTable.addQuery(refField, oldFindingDefId);
            grTable.query();
            while (grTable.next()) {
                var sourceCondition = grTable.source_condition;
                var sinkCondition = grTable.sink_condition;
				var oldChain = grTable.finding_chain;
                grTable[refField] = newFindingDefId;
				grTable["finding_chain"] = oldAndNewFindingChain[oldChain];
                grTable["source_condition"] = oldAndNewFindingDefCondition[sourceCondition];
                grTable["sink_condition"] = oldAndNewFindingDefCondition[sinkCondition];
                grTable.setWorkflow(false);
                grTable.insert();
            }
        }
    },

	_duplicateFindingChain: function(oldFindingId, newFindingId) {
		var field = "finding_def";
		var oldAndNewFindingChain = {};
		var grChain = new GlideRecord("promin_finding_def_chain");
		grChain.addQuery(field, oldFindingId);
		grChain.query();
		while (grChain.next()) {
			var oldSysId = grChain.getUniqueValue();
			grChain[field] = newFindingId;
			grChain.setWorkflow(false);
			var newSysId = grChain.insert();
			oldAndNewFindingChain[oldSysId] = newSysId;
		}
		return oldAndNewFindingChain;
	},

    _duplicateFindingDefCondAndGetConfig: function(oldUniqueSysId, newUniqueSysId, field) {
        var oldAndNewFindingDefCondition = {};
        var grCondition = new GlideRecord("promin_finding_def_condition");
        grCondition.addQuery(field, oldUniqueSysId);
        grCondition.query();
        while (grCondition.next()) {
            var oldSysId = grCondition.getUniqueValue();
            grCondition[field] = newUniqueSysId;
            grCondition.setWorkflow(false);
            var newSysId = grCondition.insert();
            oldAndNewFindingDefCondition[oldSysId] = newSysId;
        }

        var grCondNew = new GlideRecord("promin_finding_def_condition");
        grCondNew.addQuery(field, newUniqueSysId);
        grCondNew.query();
        while (grCondNew.next()) {
            if (!gs.nil(grCondNew["left"])) {
                grCondNew["left"] = oldAndNewFindingDefCondition[grCondNew["left"]];
            }
            if (!gs.nil(grCondNew["right"])) {
                grCondNew["right"] = oldAndNewFindingDefCondition[grCondNew["right"]];
            }
            if (!gs.nil(grCondNew["context"])) {
                grCondNew["context"] = oldAndNewFindingDefCondition[grCondNew["context"]];
            }
            grCondNew.update();
        }
        return oldAndNewFindingDefCondition;
    },
    getLatestAvailableVersion: function(grProjectDef) {
        var grVersion = new GlideRecord('promin_model_def_version');
        grVersion.addQuery("project", grProjectDef.getUniqueValue());
        grVersion.addQuery("state", "AVAILABLE");
        grVersion.orderByDesc('sys_created_on');
        grVersion.setLimit(1);
        grVersion.query();
        if (grVersion.next()) {
            return grVersion;
        }
        return undefined;
    },
    getRuleBasedFidningDefCount: function(grProjectDef) {
        var grRulebasedFindings = new GlideAggregate('promin_finding_def');
        grRulebasedFindings.addAggregate('COUNT');
        grRulebasedFindings.addQuery('project', grProjectDef.getUniqueValue());
        grRulebasedFindings.query();
        grRulebasedFindings.next();
        return grRulebasedFindings.getAggregate('COUNT');
    },
    canCopyProcessConfig: function(table) {
        var grProcess = new GlideRecord("promin_process_def");
        grProcess.addQuery("table", table);
        grProcess.addQuery("content_pack", false);
        grProcess.query();
        return !grProcess.hasNext();
    },
    copyProcessConfigForTable: function(table) {
        var responseJson = SNC.ProcessOptimization.copyProcessConfigForTable(table);
        var response = JSON.parse(responseJson);
        if (response.status == "success") {
            var grProcessConfig = new GlideRecord("promin_process_def");
            if (grProcessConfig.get(response.config)) {
                return grProcessConfig;
            }
            throw gs.getMessage("Unable to copy Process configuration");
        } else if (response.status == "error") {
            throw response.errorMessage;
        } else {
            throw gs.getMessage("Error while copying Process configuration");
        }
    },

    exportProcessConfigToUpdateSet: function(grProcess) {
        this._addMetadata(grProcess, "promin_process_def");

        var processDefRelatedTablesList = ["promin_view_field_config",
            "promin_child_table_config",
            "promin_process_category_kpi",
            "promin_control_flow_mapping",
            "promin_finding_def",
            "promin_automated_finding"
        ];

        var processDefReferenceTablesList = [{
            "table": "par_dashboard",
            "field": "par_dashboard_id"
        }, {
            "table": "ml_capability_definition_clustering",
            "field": "clustering_solution_def"
        }];

        var ruleFindingDefRelatedTables = [{
            "table": "promin_finding_def_rule",
            "field": "finding_def"
        }, {
            "table": "promin_finding_def_condition",
            "field": "finding_def"
        }, {
            "table": "promin_finding_def_constraint",
            "field": "finding_def"
        }];

        var automatedFindingRelatedTables = [{
            "table": "promin_automated_finding_configuration",
            "field": "automated_finding"
        }];

        //Export related tables for Process definition
        this._exportProcessDefRelatedTables(processDefRelatedTablesList, grProcess.sys_id, ruleFindingDefRelatedTables, automatedFindingRelatedTables);
        this._exportProcessDefReferenceTables(processDefReferenceTablesList, grProcess);

        var link = '';
        var currentApp = gs.getCurrentApplicationId();
        var updateSetName = '';
        var currentUpdateSetId = gs.getUser().getPreference("sys_update_set");
        var grUpdateSet = new GlideRecord("sys_update_set");
        grUpdateSet.addQuery("state", "in progress");
        grUpdateSet.addQuery("application", currentApp);
        grUpdateSet.addQuery("sys_id", currentUpdateSetId);
        grUpdateSet.query();
        if (grUpdateSet.next()) {
            updateSetName = grUpdateSet.getValue("name");
	    var viewUpdateSetLinkLabel = gs.getMessage("View Update Set");
            link = '<a href=' + grUpdateSet.getLink() + ' target="_blank">' + viewUpdateSetLinkLabel + '</a>';
        }

        if (gs.nil(updateSetName)) {
            return message = gs.getMessage("Error fetching the current update set. Please check if there is any in progress update set for current application");
        }

        var caseTableGr = new GlideRecord(grProcess.table);
		var successMsg =  gs.getMessage("{0} process configuration is successfully exported to the current Update Set: {1}. {2}", [caseTableGr.getLabel(), updateSetName, link]);
		return "<span>"+ successMsg +"</span>"
    },

    _exportProcessDefRelatedTables: function(processDefRelatedTablesList, processDefId, ruleFindingDefRelatedTables, automatedFindingRelatedTables) {
        for (var count = 0; count < processDefRelatedTablesList.length; count++) {
            var tableName = processDefRelatedTablesList[count];
            var glideRecord = new GlideRecord(processDefRelatedTablesList[count]);
            glideRecord.addQuery("process_def", processDefId);
            glideRecord.query();
            while (glideRecord.next()) {
                this._addMetadata(glideRecord, tableName);
                if (tableName == "promin_finding_def") {
                    this._exportFindingsRelatedTables(ruleFindingDefRelatedTables, glideRecord.sys_id);
                } else if (tableName == "promin_automated_finding") {
                    this._exportFindingsRelatedTables(automatedFindingRelatedTables, glideRecord.sys_id);
                }
                if (!gs.nil(glideRecord.impacted_kpis)) {
                    this._exportPaIndicators(glideRecord.impacted_kpis);
                }
            }
        }
    },

    _exportProcessDefReferenceTables: function(processDefReferenceTablesList, grProcessDef) {
        for (var count = 0; count < processDefReferenceTablesList.length; count++) {
            var tableName = processDefReferenceTablesList[count].table;
            var fieldName = processDefReferenceTablesList[count].field;
            if (gs.nil(grProcessDef.getValue(fieldName))) {
                continue;
            }
            var value = grProcessDef.getValue(fieldName);
            var glideRecord = new GlideRecord(tableName);
            glideRecord.addQuery("sys_id", value);
            glideRecord.query();
            if (glideRecord.next()) {
                this._addMetadata(glideRecord, tableName);
                if (tableName == "ml_capability_definition_clustering" && !gs.nil(glideRecord.getValue("word_vector_corpus"))) {
                    this._exportWordCorpus(glideRecord.getValue("word_vector_corpus"));
                }
            }
        }
    },

    _exportFindingsRelatedTables: function(findingDefRelatedTables, findingDefId) {
        for (var count = 0; count < findingDefRelatedTables.length; count++) {
            var tableName = findingDefRelatedTables[count].table;
            var fieldName = findingDefRelatedTables[count].field;
            var glideRecord = new GlideRecord(tableName);
            glideRecord.addQuery(fieldName, findingDefId);
            glideRecord.query();
            while (glideRecord.next()) {
                this._addMetadata(glideRecord, tableName);
            }
        }
    },

    _exportWordCorpus: function(wordCorpusId) {
        var gr = new GlideRecord("ml_word_vector_corpus");
        gr.addQuery("sys_id", wordCorpusId);
        gr.query();
        if (gr.next()) {
            this._addMetadata(gr, "ml_word_vector_corpus");
        }
        var wordCorpusDetailGr = new GlideRecord("ml_word_vector_corpus_details");
        wordCorpusDetailGr.addQuery("word_vector_corpus", wordCorpusId);
        wordCorpusDetailGr.query();
        while (wordCorpusDetailGr.next()) {
            this._addMetadata(wordCorpusDetailGr, "ml_word_vector_corpus_details");
        }
    },

    _exportPaIndicators: function(kpiIndicatorId) {
        var gr = new GlideRecord("pa_indicators");
        gr.addQuery("sys_id", kpiIndicatorId);
        gr.query();
        if (gr.next()) {
            this._addMetadata(gr, "pa_indicators");
        }
    },

    _addMetadata: function(linkedRecord, table) {
        var payloadStr = gs.unloadRecordToXML(linkedRecord, true);
        var output = new GlideRecord('sys_metadata_link');
        output.initialize();
        output.payload = payloadStr;
        output.documentkey = linkedRecord.sys_id;
        output.tablename = table;
        output.sys_name = linkedRecord.getDisplayValue();
        output.directory = "update";
        output.insert();
    },

    type: 'ProminUIActionSNC'
};
