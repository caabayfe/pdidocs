var ProminCOEUtilSNC = Class.create();
ProminCOEUtilSNC.prototype = {
    initialize: function() {
        this.tableName = {
            "automationReq": "sn_ac_automation_request",
            "automationReqM2M": "sn_ac_m2m_request_source",
            "prominProject": "promin_project",
            "prominFindingDef": "promin_finding_def",
            "prominProcessDef": "promin_process_def"
        };
        this.automationCenterPluginId = 'sn_ac';
        this.dynamicTranslationPluginId = 'com.glide.dynamic_translation';
    },
    /*
		get configuration related to plugin, user permissions for automation request/center
        */
    getConfig: function() {
        var canCreate = false,
            canRead = false,
            isPluginExist = GlidePluginManager.isActive(this.automationCenterPluginId);

        if (isPluginExist) {
            var grAutomationReq = new GlideRecord(this.tableName.automationReq);
            canCreate = grAutomationReq.canCreate();
            canRead = new GlideSecurityManager().tableLevelACLAllow(grAutomationReq, "read");
        }

        var responseJSON = {
            "isPluginActive": isPluginExist,
            "permissions": {
                "canCreate": canCreate,
                "canRead": canRead
            }
        };
        return responseJSON;
    },
    /*
    	get installed information related to dynamic translation plugin
    */
    getDynamicTranslationConfig: function() {
        var isPluginActive = GlidePluginManager.isActive(this.dynamicTranslationPluginId);
        return {
            "isPluginActive": isPluginActive
        };
    },
    /*
    	get process configuration for a table
    */
    getProcessConfig: function(reqParms) {
        var response = {
            clusterAnalysisEnabled: false,
            rootCauseAnalysisEnabled: false,
            worknotesAnalysisEnabled: false
        };
        var grProcDef = new GlideRecord(this.tableName.prominProcessDef);
        grProcDef.addQuery("table", reqParms.table);
        grProcDef.query();
        while (grProcDef.next()) {
            if (grProcDef.getValue('rca_fields') && grProcDef.getValue('rca_fields').length) {
                response.rootCauseAnalysisEnabled = true;
            }
            if ((grProcDef.getValue('work_note_field_name') && grProcDef.getValue('work_note_field_name').length) || (grProcDef.getValue('comment_field_name') && grProcDef.getValue('comment_field_name').length)) {
                response.worknotesAnalysisEnabled = true;
            }
            if (!gs.nil(grProcDef.clustering_solution_def)) {
                var grCSD = grProcDef.clustering_solution_def.getRefRecord();
                if (grCSD.isValidRecord()) {
                    response.clusterAnalysisEnabled = grCSD.getValue('table') == reqParms.table;
                }
            }

        }
        return response;
    },
    /*
    	add/remove m2m (sn_ac_m2m_request_source) records to link project/finding def and automation request(s)
    */
    updateAutomationReqM2M: function(reqParms) {
        var reqIds = reqParms.reqIds,
            projectId = reqParms.projectId,
            findingDefId = reqParms.findingDefId,
            action = reqParms.action,
            source = reqParms.source,
            message = "",
            success = true;
        try {
            if (reqIds.length == 0 || reqIds[0].length < 32) {
                throw gs.getMessage("Invalid automation request id(s): {0} ", [reqIds.toString()]);
            }
            var failedReqList = [];

            if (source == 'project') {
                this._validateProjectId(projectId);
                if (action == "link") {
                    this._linkAutomation(this.tableName.prominProject, projectId, reqIds, failedReqList);

                } else if (action == "unlink") {
                    this._unlinkAutomation(this.tableName.prominProject, projectId, reqIds, failedReqList);

                }
            } else if (source == 'finding') {
                this._validateFindingDefId(findingDefId);
                if (action == "link") {
                    this._linkAutomation(this.tableName.prominFindingDef, findingDefId, reqIds, failedReqList);

                } else if (action == "unlink") {
                    this._unlinkAutomation(this.tableName.prominFindingDef, findingDefId, reqIds, failedReqList);

                }
            }
            if (failedReqList.length > 0) {
                throw gs.getMessage("Automation request for '{0}' failed.", [failedReqList.toString()]);
            }

        } catch (e) {
            gs.error("Error occurred in script include ProminCOEUtilSNC. Error Message: " + e);
            success = false;
            message = e;
        }
        return {
            "success": success,
            "message": message
        };
    },
    _validateProjectId: function(projectId) {
        var grProject = new GlideRecord(this.tableName.prominProject);
        if (!grProject.get(projectId)) {
            throw gs.getMessage("Project ID '{0}' is not valid", [projectId]);
        }
        if (!grProject.canRead()) {
            throw gs.getMessage("Read permission on project ('{0}') is required for linking automation requests", [projectId]);
        }
    },
    _validateFindingDefId: function(findingDefId) {
        var grFindingDef = new GlideRecord(this.tableName.prominFindingDef);
        if (!grFindingDef.get(findingDefId)) {
            throw gs.getMessage("Finding Def ID '{0}' is not valid", [findingDefId]);
        }
        var projectId = grFindingDef.getValue('project');
        if (projectId) {
            this._validateProjectId(projectId);
        }
    },
    _linkAutomation: function(table, id, reqIds, failedReqList) {
        var grAutomationReq = new GlideRecord(this.tableName.automationReq);
        var grM2M = new GlideRecord(this.tableName.automationReqM2M);
        for (var cnt = 0; cnt < reqIds.length; cnt++) {
            var automationReqId = reqIds[cnt];
            if (!grAutomationReq.get(automationReqId) || !grAutomationReq.isValidRecord() || !grAutomationReq.canRead()) {
                throw gs.getMessage("Automation Request ID '{0}' is not valid or you don't have read access.", [automationReqId]);
            }
            grM2M.initialize();
            grM2M.setValue('auto_request', automationReqId);
            grM2M.setValue('source_table', table);
            grM2M.setValue('source_record', id);
            if (grM2M.insert() == null) {
                failedReqList.push(automationReqId);
            }
        }
    },
    _unlinkAutomation: function(table, id, reqIds, failedReqList) {
        var grM2M = new GlideRecord(this.tableName.automationReqM2M);
        grM2M.addQuery("source_table", table);
        grM2M.addQuery("source_record", id);
        grM2M.addQuery("auto_request", "IN", reqIds.toString());
        grM2M.query();
        while (grM2M.next()) {
            if (!grM2M.deleteRecord()) {
                failedReqList.push(grM2M.getValue("auto_request"));
            }
        }
    },
    type: 'ProminCOEUtilSNC'
};
