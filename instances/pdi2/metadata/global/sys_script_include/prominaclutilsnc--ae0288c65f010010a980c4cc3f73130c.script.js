var ProminACLUtilSNC = Class.create();
ProminACLUtilSNC.prototype = {

    initialize: function(grProject) {
        this.permission_table = "promin_permission";
        this.version_table = "promin_model_def_version";
        this.roles = {
            "admin": "sn_process_mining_admin",
            "powerUser": "sn_process_mining_power_user",
            "analyst": "sn_process_mining_analyst",
            "maint": "maint",
            "nobody": "nobody"
        };
        this.grProject = grProject;
        this.projectId = grProject.sys_id;
    },
    canRead: function() {
        return this._isNewRecord() || this._checkPrivilege('read');
    },
    canReadWithRestrictedAccessCheck: function() {
        return this.canRead() && this.canAccessRestrictedProject();
    },
    canWrite: function() {
        return this._isNewRecord() || this._checkPrivilege('write');
    },
    canDelete: function() {
        if (this.grProject.content_pack || this.grProject.source.startsWith("FREEMIUM_")) {
            return gs.hasRole("maint");
        } else {
            return this._hasProminPowerUserRole() || this._isProjectCreatedByCurrentAnalyst();
        }
    },
    _isNewRecord: function() {
        return gs.nil(this.grProject) || this.grProject.isNewRecord(); // gs.nil(true) for all dependent table
    },
    _checkPrivilege: function(operation) {
        if (this.grProject.is_template && operation == "read") {
            return this._canAccessDefaultModel();
        } else if (this.grProject.source.startsWith('FREEMIUM') && operation != "read") {
            return gs.getUser().hasRole(this.roles.maint);
        } else if (this.grProject.content_pack) {
            return (operation == "read" && gs.hasRole("sn_process_mining_analyst")) || gs.hasRole("maint");
        } else {
            return (
                this._hasProminPowerUserRole() ||
                this._isProjectCreatedByCurrentAnalyst() ||
                this.isProjectSharedWithAnaylst(operation)
            );
        }
    },
    _canAccessDefaultModel: function() {
        return this._hasProminAnalystUserRole() || this._isProjectCreatedByCurrentAnalyst();
    },
    _hasProminPowerUserRole: function() {
        return gs.hasRole(this.roles.powerUser);
    },
    _hasProminAdminUserRole: function() {
        return gs.hasRole(this.roles.admin);
    },
    _hasProminAnalystUserRole: function() {
        return gs.hasRole(this.roles.analyst);
    },
    _isProjectCreatedByCurrentAnalyst: function() {
        return (this.grProject.sys_created_by == gs.getUserName() && this._hasProminAnalystUserRole());
    },
    isProjectSharedWithAnaylst: function(operation) {
        var grPermission = new GlideRecord(this.permission_table);
        grPermission.addQuery("project", this.grProject.sys_id);
        if (!gs.nil(operation))
            grPermission.addQuery(operation, true);
        grPermission.addNotNullQuery("role");
        grPermission.query();
        while (grPermission.next()) {
            var aryRoles = grPermission.getDisplayValue("role").split(", ");
            for (var counter in aryRoles) {
                if (!gs.nil(aryRoles[counter]) && gs.hasRole(aryRoles[counter])) {
                    return true;
                }
            }
        }
        grPermission = new GlideRecord(this.permission_table);
        grPermission.addQuery("project", this.grProject.sys_id);
        if (!gs.nil(operation))
            grPermission.addQuery(operation, true);
        grPermission.addEncodedQuery("userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^OR" +
            "groupDYNAMICd6435e965f510100a9ad2572f2b47744");
        grPermission.query();
        return grPermission.hasNext();
    },
    canWriteInChildTableDef: function() {
        return this.canWrite() && this._checkChildTableDefAccess('write') && !this.isMiningJobActive();
    },
    canDeleteChildTableDef: function() {
        return this._checkPrivilege('delete') && this._checkChildTableDefAccess('delete') && !this.isMiningJobActive();
    },
    canShareProject: function() {
        if (gs.nil(this.grProject)) {
            return true;
        } else if (this.grProject.source.startsWith('FREEMIUM')) {
            return gs.hasRole(this.roles.maint);
        } else {
            return this._hasProminPowerUserRole() || this._isProjectCreatedByCurrentAnalyst();
        }
    },
    canUpdateSourceTypeAndOtherDependentFields: function() {
        return this._checkChildTableDefAccess('write');
    },
    _checkChildTableDefAccess: function(operation) {
        return this._isProjectCreatedByCurrentAnalyst() || this._hasProminPowerUserRole() || !this.isProjectSharedWithAnaylst(operation);
    },
    isSharedProject: function() {
        /* to display message to the user when definition is opened */
        try {
            return !this._isProjectCreatedByCurrentAnalyst() && !this._hasProminPowerUserRole() && this.isProjectSharedWithAnaylst('write');
        } catch (err) {
            return false;
        }
    },
    canWriteRestrictedField: function() {
        return (gs.hasRole(this.roles.maint) || (this.grProject.sys_created_by == gs.getUserName()) || this._isNewRecord());
    },
    canAccessRestrictedProject: function() {
        if (this.grProject.restricted == true) {
            return this.canWriteRestrictedField() || this.isProjectSharedWithAnaylst('read');
        } else
            return true;
    },
    isMiningJobActive: function() {
        var state = this.grProject.getValue("state");
        return state == 'SCHEDULED' || state == 'MINING_DATA';
    },
    _checkRole: function(role) {
        if (!role) {
            role = this.roles.analyst;
        }
        return gs.hasRole(role);
    },
    iscreatorUserPresent: function() {
        var createdBy = this.grProject.getValue("sys_created_by");
        var creatorUser = gs.getUser().getUserByID(createdBy);
        if (gs.nil(creatorUser.getID())) {
            return createdBy;
        } else {
            return "";
        }
    },
    isMaint: function() {
        return this._checkRole(this.roles.maint);
    },
    isCreator: function() {
        return (this.grProject.getValue("sys_created_by") == gs.getUserName());
    },
    getLEProgressTypeFieldPresent: function() {
        try {
            var grEntity = new GlideRecordSecure("promin_project_entity");
            grEntity.addQuery("project", this.projectId);
            grEntity.addNullQuery("parent_entity");
            grEntity.query();

            var entityCount = grEntity.getRowCount();
            if (entityCount == 1 && grEntity.next()) {
                return new global.ProminUtils().isLeProgressTypeFieldPresent(grEntity.table);
            }
            return false;

        } catch (err) {
            return false;
        }
    },
    isProjectShared: function(projectId) {
        if (projectId) {
            this.grProject.sys_id = projectId;
        }
        try {
            return !this._isProjectCreatedByCurrentAnalyst() && !this._hasProminPowerUserRole() && this.isProjectSharedWithAnaylst('write');
        } catch (err) {
            return {
                'result': false
            };
        }
    },
    getProjectPermissions: function() {
        var gsm = new GlideSecurityManager();
        var gr_activity_def = new GlideRecord('promin_activity_def');
        var gr_project_entity = new GlideRecord('promin_project_entity');
        var gr_breakdown_field = new GlideRecord('promin_breakdown_field');
        var gr_promin_project = new GlideRecord('promin_project');
        var gr_promin_finding_def = new GlideRecord('promin_finding_def');
        var gr_promin_automated_finding = new GlideRecord('promin_automated_finding');
        var gr_promin_automated_finding_configuration = new GlideRecord('promin_automated_finding_configuration');
        var gr_promin_finding_def_rule = new GlideRecord('promin_finding_def_rule');
        var gr_promin_finding_def_constraint = new GlideRecord('promin_finding_def_constraint');
        var gr_process_def = new GlideRecord('promin_process_def');

        var hasProjectEntityAnalystAccess = this._checkRole();
        var iscreatorUserPresent = this.iscreatorUserPresent();
        var getLEProgressTypeFieldPresent = this.getLEProgressTypeFieldPresent();

        return {
            iscreatorUserPresent: iscreatorUserPresent,
            getLEProgressTypeFieldPresent: getLEProgressTypeFieldPresent,
            isMaint: this.isMaint(),
            isCreator: this._isNewRecord() || this.isCreator(),
            promin_project: {
                canCreate: gsm.tableLevelACLAllow(gr_promin_project, "create"),
                canDelete: this.canDelete(),
                canRead: this.canRead(),
                canWrite: this.canWrite(),
                fields: {
                    auto_retire: {
                        canWrite: this.grProject.getElement('auto_retire').canWrite()
                    },
                    content_pack: {
                        canWrite: this._checkRole(this.roles.maint)
                    },
                    goal: {
                        canWrite: this._checkRole() && this.canUpdateSourceTypeAndOtherDependentFields()
                    },
                    is_template: {
                        canWrite: this._checkRole(this.roles.powerUser)
                    },
                    source: {
                        canWrite: this._checkRole(this.roles.nobody)
                    },
                }
            },
            promin_activity_def: {
                canCreate: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_activity_def, "create"),
                canDelete: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_activity_def, "delete"),
                canRead: gsm.tableLevelACLAllow(gr_activity_def, "read"),
                canWrite: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_activity_def, "write")
            },
            promin_project_entity: {
                canCreate: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_project_entity, "create"),
                canDelete: gsm.tableLevelACLAllow(gr_project_entity, "delete"),
                canRead: gsm.tableLevelACLAllow(gr_project_entity, "read"),
                canWrite: gsm.tableLevelACLAllow(gr_project_entity, "write"),
                fields: {
                    custom_end_condition: {
                        canWrite: hasProjectEntityAnalystAccess && this.canUpdateSourceTypeAndOtherDependentFields()
                    },
                    custom_start_condition: {
                        canWrite: hasProjectEntityAnalystAccess && this.canUpdateSourceTypeAndOtherDependentFields()
                    },
                    external_dataset: {
                        canWrite: hasProjectEntityAnalystAccess
                    },
                    filter: {
                        canWrite: hasProjectEntityAnalystAccess && this.canUpdateSourceTypeAndOtherDependentFields()
                    },
                    include_approvals: {
                        canWrite: hasProjectEntityAnalystAccess && this.canUpdateSourceTypeAndOtherDependentFields()
                    },
                    report_source: {
                        canWrite: hasProjectEntityAnalystAccess
                    },
                    source_type: {
                        canWrite: hasProjectEntityAnalystAccess
                    },
                    table: {
                        canWrite: hasProjectEntityAnalystAccess
                    }
                }
            },
            promin_breakdown_field: {
                canCreate: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_breakdown_field, "create"),
                canDelete: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_breakdown_field, "delete"),
                canRead: gsm.tableLevelACLAllow(gr_breakdown_field, "read"),
                canWrite: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_breakdown_field, "write")
            },
            promin_finding_def: {
                canCreate: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_promin_finding_def, "create"),
                canDelete: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_promin_finding_def, "delete"),
                canRead: gsm.tableLevelACLAllow(gr_promin_finding_def, "read"),
                canWrite: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_promin_finding_def, "write"),
                fields: {
                    copied_from: {
                        canWrite: this._checkRole(this.roles.nobody)
                    }
                }
            },
            promin_automated_finding: {
                canCreate: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_promin_automated_finding, "create"),
                canDelete: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_promin_automated_finding, "delete"),
                canRead: gsm.tableLevelACLAllow(gr_promin_automated_finding, "read"),
                canWrite: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_promin_automated_finding, "write"),
                fields: {
                    copied_from: {
                        canWrite: this._checkRole(this.roles.nobody)
                    }
                }
            },
            promin_automated_finding_configuration: {
                canCreate: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_promin_automated_finding_configuration, "create"),
                canDelete: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_promin_automated_finding_configuration, "delete"),
                canRead: gsm.tableLevelACLAllow(gr_promin_automated_finding_configuration, "read"),
                canWrite: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_promin_automated_finding_configuration, "write"),
            },
            promin_finding_def_rule: {
                canCreate: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_promin_finding_def_rule, "create"),
                canWrite: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_promin_finding_def_rule, "write"),
            },
            promin_finding_def_constraint: {
                canCreate: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_promin_finding_def_constraint, "create"),
                canWrite: !this.isSharedProject() && gsm.tableLevelACLAllow(gr_promin_finding_def_constraint, "write"),
            },
            promin_process_def: {
                canRead: Boolean(this.canRead() && gsm.tableLevelACLAllow(gr_process_def, "read")),
                canWrite: Boolean(this._hasProminPowerUserRole() && gsm.tableLevelACLAllow(gr_process_def, "write")),
                canCreate: Boolean(this._hasProminPowerUserRole() && gsm.tableLevelACLAllow(gr_process_def, "create")),
            },
            auto_retire: gs.getProperty("promin.auto_retire_days", 90),
        };
    },
    getProjectAutoRetiredMessage: function() {
        if (this.grProject.status != "RETIRED" && !this.grProject.retired_date) {
            return null;
        }
        var autoCleanDays = gs.getProperty("promin.auto_clean_days", 90);
        var cleanupDate = new GlideDateTime(this.grProject.retired_date);
        cleanupDate.addDays(autoCleanDays);
        var currentDate = new GlideDateTime();
        var difference = GlideDateTime.subtract(currentDate, cleanupDate);
        var days = difference.getRoundedDayPart();
        var isProjectStateNew = this.grProject.state == 'NEW';
        if (this.grProject.status == "RETIRED") {
            if (!isProjectStateNew && days > 0) {
                return gs.getMessage("Note: This retired project will be cleaned after {0} days. Please update the status to retain your data or generate the model", [days]);
            } else if (!gs.nil(this.grProject.last_mined_time)) {
                return gs.getMessage("This project's data has been cleaned since it has been {0} days since it was retired. Please generate the model again to view results. Contact the system administrator to change the cleaning settings.", [days]);
            }
        }
        return null;
    },
	isPlaybookProject: function() {
		var grProjectEntity = new GlideRecord("promin_project_entity");
		grProjectEntity.addQuery("project", this.projectId);
		grProjectEntity.addQuery("source_type", "PLAYBOOK_DATA");
		grProjectEntity.addNullQuery("parent_entity");
		grProjectEntity.query();
		return grProjectEntity.hasNext();
	},
	canReadTaskMiningProject: function() {
		var grTMProject = new GlideRecordSecure("sn_tm_core_project");
		grTMProject.addQuery("sys_id", this.grProject.tm_project);
		grTMProject.query();
		if(grTMProject.hasNext()){
			return true;
		}
		return false;
	},
    type: 'ProminACLUtilSNC'
};
