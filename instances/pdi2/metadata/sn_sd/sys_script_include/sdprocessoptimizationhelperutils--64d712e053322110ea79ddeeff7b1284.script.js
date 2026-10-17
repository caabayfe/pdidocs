var SDProcessOptimizationHelperUtils = Class.create();
SDProcessOptimizationHelperUtils.prototype = {
    initialize: function() {
        this.utils = new sn_sd.SDConstants();
    },

    getUserSysId: function(userId) {
        var gr = new GlideRecord(SDConstants.tableNames.SYSUSER);
        if (gr.get("user_name", userId))
            return gr.sys_id;
        return "";
    },

    getSimilarPOProject: function(table, filter, fields) {
        var fieldCount = fields.split(",").length;
        var gr = new GlideRecord("promin_project_entity");
        gr.addQuery("project.is_template", "false");
        gr.addQuery("table", table);
        gr.addQuery("filter", filter);
        gr.query();
        while (gr.next()) {
            var grDef = new GlideAggregate("promin_activity_def");
            grDef.addAggregate("COUNT");
            grDef.addEncodedQuery("entity=" + gr.getUniqueValue() + "^fieldIN" + GlideStringUtil.escapeQueryTermSeparator(fields), true);
            grDef.query();
            if (grDef.next() && grDef.getAggregate("COUNT") >= fieldCount)
                return gr.getValue("project");
        }
        return "";

    },

    getTemplateType: function(templateSysId) {
        var gr = new GlideRecord(SDConstants.tableNames.POPROJECT);
        if (gr.get(templateSysId))
            return gr.getDisplayValue("template_type");
        return '';
    },

    getPOProjectId: function(indicatorSysId) {
        var gr = new GlideRecord(SDConstants.tableNames.CONTRIBUTINGINDICATORM2MPOPROJECT);
        if (gr.get("contributing_indicator_registry.contributing_indicator", indicatorSysId) && gr.active)
            return gr.po_project_id;
        return '';
    },

    getPOProjectEntityTable: function(projectSysId) {
        var gr = new GlideRecord(SDConstants.tableNames.POPROJECTENTITY);
        if (gr.get("project", projectSysId)) {
            var tableGr = new GlideRecord("sys_db_object");
            if (tableGr.get("name", gr.table)) {
                var grAccess = new GlideRecord(tableGr.name);
                var canRead = grAccess.canRead();

                return {
                    label: tableGr.getDisplayValue("label"),
                    canRead: canRead
                };
            }
        }
        return '';
    },

    getLatestPOProjectVersionFields: function(projectSysId) {
        var output = {};
        var gr = new GlideRecord(SDConstants.tableNames.POMODELDEFVERSION);
        gr.addEncodedQuery("state=AVAILABLE^project.sys_id=" + projectSysId);
        gr.orderByDesc("last_mined_time");
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            output.version = gr.sys_id;
            output.total_records = gr.total_records;
        } else {
            output.version = '';
            output.total_records = -1;
        }
        return output;
    },

    createPOProjectForContributingKpis: function() {
        var gr = new GlideRecord(SDConstants.tableNames.CONTRIBUTINGINDICATORM2MPOPROJECT);
        var pattern = /(\^\^EQ|\^EQ)$/;
        gr.addEncodedQuery("po_project_idISEMPTY^active=true");
        gr.query();
        while (gr.next()) {
            var templateType = this.getTemplateType(gr.po_template_id);
            var projectName = this.utils.getPOProjectName(gr.getDisplayValue("table"));
            var poInput = {
                "table": gr.getValue("table"),
                "encodedQuery": gr.getValue("po_project_condition").replace(pattern, ""),
                "name": projectName,
                "templateType": templateType,
                "source": SDConstants.POPROJECTSOURCE
            };
            var projectId = this.getSimilarPOProject(poInput.table, poInput.encodedQuery, "state,assignment_group");
            if (gs.nil(projectId)) {

                var response = this.createPOProject(poInput);
                if (response.state != SDConstants.POPROJECTCREATEDERROR && !gs.nil(response.id)) {
                    projectId = response.id;
                    gr.po_project_id = projectId;
                    gr.update();

                    this.updateKpiDashboard(projectId);
                    this.addPermissionsForSDReadRoles(projectId);
                    this.addPOProjectToScheduledJob(projectId);

                    if (response.state == "NEW")
                        var scheduleResponse = this.scheduleProjectMining(response.id);
                }
            } else {
                gr.po_project_id = projectId;
                gr.update();
            }
        }
    },

    createPOProject: function(projectInput) {
        try {
            var projectResponse = ProcessOptimization.createProjectDefinition(projectInput);
            var projectDefinition = typeof projectResponse == "string" ? JSON.parse(projectResponse) : projectResponse;
            if (!gs.nil(projectDefinition.errorMsg)) {
                gs.error(projectDefinition.errorMsg);
                return {
                    "state": SDConstants.POPROJECTCREATEDERROR
                };
            }
            return projectDefinition;
        } catch (err) {
            gs.error(err);
            return {
                "state": SDConstants.POPROJECTCREATEDERROR
            };
        }
    },

    scheduleProjectMining: function(projectID) {
        if (!gs.nil(projectID)) {
            try {
                var scheduleResponse = ProcessOptimization.scheduleMiningWithDetails(projectID);
                return typeof scheduleResponse == "string" ? JSON.parse(scheduleResponse) : projectResponse;
            } catch (err) {
                gs.error(err);
                return {
                    "state": SDConstants.POPROJECTCREATEDERROR
                };
            }
        }
    },

    updatePOProjectName: function(projectSysId, projectName) {
        var gr = new GlideRecord(SDConstants.tableNames.POPROJECT);
        if (gr.get(projectSysId)) {
            gr.name = projectName;
            gr.update();
        }
    },

    updateKpiDashboard: function(projectSysId) {
        var incidentDashboardSysId = SDConstants.INCIDENTDASHBOARDSYSID;
        var gr = new GlideRecord(SDConstants.tableNames.POPROJECT);
        if (gr.get(projectSysId)) {
            var par_dashboard_gr = new GlideRecord(SDConstants.tableNames.PARDASHBOARD);
            if (par_dashboard_gr.get(incidentDashboardSysId)) {
                gr.par_dashboard_id = incidentDashboardSysId;
                gr.update();
            }
        }
    },

    addPOProjectToScheduledJob: function(projectSysId) {
        var gr = new GlideRecord(SDConstants.tableNames.POJOBM2MPROJECT);
        gr.addQuery('project', projectSysId);
        gr.addQuery('job', SDConstants.POMONTHLYJOBSYSID);
        gr.query();
        if (!gr.next()) {
            gr.project = projectSysId;
            gr.job = SDConstants.POMONTHLYJOBSYSID;
            gr.update();
        }
    },

    addPermissionsForSDReadRoles: function(projectSysId) {
        var gr = new GlideRecord(SDConstants.tableNames.SYSUSERHASROLE);
        gr.addQuery("role", SDConstants.SDREADROLESYSID);
        gr.query();
        while (gr.next())
            this.addPermissionToPOProject(projectSysId, gr.user);
    },

    addPermissionToPOProject: function(projectSysId, userSysId) {
        var po_permission_gr = new GlideRecord(SDConstants.tableNames.POPERMISSION);
        po_permission_gr.addQuery('project', projectSysId);
        po_permission_gr.addQuery('user', userSysId);
        po_permission_gr.query();
        if (!po_permission_gr.next()) {
            po_permission_gr.initialize();
            po_permission_gr.project = projectSysId;
            po_permission_gr.user = userSysId;
            po_permission_gr.insert();
        }
    },

    removePermissionToPOProject: function(projectSysId, userSysId) {
        var po_permission_gr = new GlideRecord(SDConstants.tableNames.POPERMISSION);
        po_permission_gr.addQuery('project', projectSysId);
        po_permission_gr.addQuery('user', userSysId);
        po_permission_gr.query();
        if (po_permission_gr.next())
            po_permission_gr.deleteRecord();
    },

    type: 'SDProcessOptimizationHelperUtils'
};
