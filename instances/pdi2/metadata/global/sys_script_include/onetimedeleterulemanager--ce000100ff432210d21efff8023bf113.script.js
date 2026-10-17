var OnetimeDeleteRuleManager = Class.create();
OnetimeDeleteRuleManager.prototype = Object.extendsObject(DMRuleConstants, {
    _LOGGER: undefined,
    _dmDeleteUtil: undefined,
    _dmcUtils: undefined,

    initialize: function() {
        this._LOGGER = new GSLog("", this.DATA_MANAGEMENT_CONSOLE);
        this._dmDeleteUtil = new DMDeleteUtil();
        _dmcUtils = new DMCUtils();
    },

    isOneTimeDeleteEligible: function(tableName) {
        return GlideTableDescriptor.isValid(tableName);
    },

    getRollbackExcludedTables: function(sysId, tableName) {
        return this._dmDeleteUtil.getRollbackExcludedTables(sysId, tableName);
    },

    createOrUpdateRule: function(rule) {
        const gr = new GlideRecord(this.TABLES.SYS_DM_DELETE);
        const isUpdate = JSUtil.notNil(rule.sys_id) && gr.get(rule.sys_id);
        if (!isUpdate) {
            gr.initialize();
        }
        // TODO: Support enable cascade delete and record_rollback checkboxes
        const {
            name,
            description,
            table,
            condition,
            set_workflow,
            cascade_delete,
            record_rollback,
            run_at,
            schedule_type,
            rule_confirmed
        } = rule;

        gr.setValue("name", name);
        gr.setValue("description", description);
        gr.setValue("table", table);
        gr.setValue("condition", condition);
        gr.setValue("set_workflow", set_workflow);

        if (JSUtil.notNil(schedule_type) && schedule_type == this.SCHEDULE_TYPE.EXECUTE_LATER) {
            const response = this._validateExecutionTime(run_at, rule.sys_id);
            if (response.status == this.STATUS.ERROR) {
                return response;
            }
            gr.setValue("run_at", new GlideDateTime(run_at, true));
        }


        // Save Rule
        const sysID = isUpdate ? gr.update() : gr.insert();
        const result = this._buildResult(gr, sysID);

        // Post save - schedule or execute rule
        if (result.status == this.STATUS.SUCCESS) {

            // check ACL before scheduling/executing job
            const errMsg = this._hasRightsToExecute(gr);
            if (errMsg) {
                return {
                    sysID: sysID,
                    status: this.STATUS.ERROR,
                    messages: [errMsg]
                };
            }

            // Get Rollback excluded tables list
            const rollbackExcludedList = this.getRollbackExcludedTables(sysID, table);
            result.rollbackExcludedList = rollbackExcludedList;

            if (rule_confirmed) {
                if (schedule_type == this.SCHEDULE_TYPE.EXECUTE_LATER) {
                    const response = this._validateExecutionTime(run_at, rule.sys_id);
                    if (response.status == this.STATUS.ERROR) {
                        return response;
                    }

                    // Proceed with delete job scheduling
                    new global.DMTSchedulerUtils().scheduleDM(gr, this.TABLES.SYS_DM_DELETE);
                } else if (schedule_type == this.SCHEDULE_TYPE.EXECUTE_UPON_CREATION) {
                    result.redirectUrl = this._execute(gr, sysID);
                    this._LOGGER.logDebug(`Invoked execution of onetime delete rule - ${name}`);
                }

            }
        }
        return result;
    },

    getRule: function(sysID) {
        const gr = new GlideRecord(this.TABLES.SYS_DM_DELETE);
        if (gr.get(sysID)) {
            return {
                "name": gr.getValue("name") ? gr.getValue("name") : gr.getValue("number"),
                "description": gr.getValue("description"),
                "table": gr.getValue("table"),
                "run_at": gr.getValue("run_at") ? new GlideDateTime(gr.getValue("run_at")).getDisplayValue() : "",
                "state": gr.getValue("state"),
                "condition": gr.getValue("condition"),
                "schedule": gr.getValue("schedule"),
                "set_workflow": gr.getValue("set_workflow") == 0 ? false : true,
                "cascade_delete": true, //Cascade delete and rollbacks are enabled by default and they can not be disbaled.
                "record_rollback": true,
                "number": gr.getValue("number"),
                "sys_id": sysID,
                "can_delete": gr.canDelete()
            };
        }
    },


    updateAndScheduleRule: function(rule) {
        const dmDeleteRecord = new GlideRecord(this.TABLES.SYS_DM_DELETE);
        const isUpdate = JSUtil.notNil(rule.sys_id) && dmDeleteRecord.get(rule.sys_id);
        if (!isUpdate) {
            return {
                status: this.STATUS.ERROR,
                messages: [gs.getMessage("No record found to update.")],
            };
        }

        const {name, description, table, condition, set_workflow, run_at} = rule;
        dmDeleteRecord.setValue("name", name);
        dmDeleteRecord.setValue("description", description);
        dmDeleteRecord.setValue("table", table);
        dmDeleteRecord.setValue("condition", condition);
        dmDeleteRecord.setValue("set_workflow", set_workflow);
        
        // Validate run time
        const response = this._validateExecutionTime(run_at, rule.sys_id);
        if (response.status == this.STATUS.ERROR) {
            return response;
        }

        // set schedule time in glide record
        dmDeleteRecord.setValue("run_at", new GlideDateTime(run_at, true));
        //Before scheduling check if user has rights to execute
        const errMsg = this._hasRightsToExecute(dmDeleteRecord);
        if (errMsg) {
            return {
                sysID: rule.sys_id,
                status: this.STATUS.ERROR,
                messages: [errMsg]
            };
        }

        const sysID = dmDeleteRecord.update();
        const result = this._buildResult(dmDeleteRecord, sysID);
        // Proceed with delete job scheduling
        new global.DMTSchedulerUtils().scheduleDM(dmDeleteRecord, this.TABLES.SYS_DM_DELETE);
        return result;
    },

    executeRule: function (sysID) {
        const dmDeleteRecord = new GlideRecord(this.TABLES.SYS_DM_DELETE);
        if (dmDeleteRecord.get(sysID)) {
            const url = this._execute(dmDeleteRecord, sysID);
            return url;
        }
    },

    _validateExecutionTime(run_at, sys_id) {
        if (JSUtil.nil(run_at)) {
            return {
                sysID: sys_id,
                status: this.STATUS.ERROR,
                messages: [gs.getMessage("Please specify valid date and time for execution.")],
                errorCode: this.ERROR_CODES.EMPTY_SCHEDULE_TIME,
            };
        }

        // Check if the scheduled date has passed.
        if (this._hasTargetTimeElapsed(run_at)) {
            return {
                sysID: sys_id,
                status: this.STATUS.ERROR,
                messages: [gs.getMessage("Scheduled time has passed.")],
                errorCode: this.ERROR_CODES.PAST_SCHEDULE_TIME
            };
        }
    },

    _execute: function(gr, sysID) {
        var worker = new GlideDataManagementProgressWorker(gr);
        worker.setBackground(true);
        worker.start();
        return `dm_delete_status.do?sysparm_pworker_sysid=${worker.getProgressID()}&sysparm_sys_id=${sysID}`;
    },


    _hasTargetTimeElapsed: function(run_at) {
        const runDate = new GlideDateTime(run_at, true).getNumericValue();
        const now = new GlideDateTime().getNumericValue();
        return runDate <= now;
    },

    _hasRightsToExecute: function(gr) {
        return new SNC.DataManagementAPI().hasRightToExecute(gr);
    },

    _buildResult: function(gr, sysID) {
        if (!sysID) {
            const errMsgs = gs.getErrorMessages();
            this._LOGGER.logErr(errMsgs);
            return {
                status: this.STATUS.ERROR,
                messages: [errMsgs]
            };
        }
        return {
            sysID: sysID,
            status: this.STATUS.SUCCESS
        };
    },
    fetchCascadeDeletePreview: function(ruleSysID) {
        const response = {
            rowCount: 0,
            rows: [],
            messages: []
        };
        const current = new GlideRecord(this.TABLES.SYS_DM_DELETE);
        current.addQuery("sys_id", ruleSysID);
        current.query();
        if (current.next()) {
            var dmAPI = new SNC.DataManagementAPI();
            var has_more_cascade_level = dmAPI.createPreviewCascadeCounts(current);
            if (has_more_cascade_level) {
                var max_level = GlideProperties.get("glide.cascade.preview_max_level") || 3;
                response.messages.push(gs.getMessage("Data Management Preview Cascade", max_level));
            }
            response.messages.push(gs.getMessage("Preview cascade is a close-to estimate, the latest inserted record may not be shown due to replication lag"));
        }
        const gr = new GlideRecord(this.TABLES.SYS_DM_DELETE_COUNT);
        gr.addQuery(this.FIELDS.DM_DELETE, ruleSysID);
        gr.query();
        while (gr.next()) {
            const tableName = gr.getValue(this.FIELDS.TABLE);
            const tableLabel = GlideTableDescriptor.get(tableName).getLabel();
            response.rows.push({
                sys_id: gr.getUniqueValue(),
                actual_record_count: gr.getValue(this.FIELDS.ACTUAL_RECORD_COUNT),
                preview_record_count: gr.getValue(this.FIELDS.PREVIEW_RECORD_COUNT),
                table: `${tableLabel} [${tableName}]`,
                sys_created_on: gr.getValue(this.FIELDS.SYS_CREATED_ON),
                sys_created_by: gr.getDisplayValue(this.FIELDS.SYS_CREATED_BY),
            });
        }
        response.rowCount = response.rows.length;
        //Sort in descending order of estimated record count.
        response.rows = response.rows.sort((record1, record2) => record2[this.FIELDS.PREVIEW_RECORD_COUNT] - record1[this.FIELDS.PREVIEW_RECORD_COUNT]);
        return response;
    },

    deleteRule: function(sysId) {
        const rule = this.getRule(sysId);
        let status = _dmcUtils.deleteRecord(this.TABLES.SYS_DM_DELETE, sysId);
		let message = gs.getMessage("The rule has been deleted successfully.");
		if(rule.schedule) {
			message = gs.getMessage("The rule and its associated scheduled job({0}) were successfully deleted.", rule.schedule);
		}
        return {
            status: status ? this.STATUS.SUCCESS : this.STATUS.ERROR,
			message: message
        };
    },

    type: 'OnetimeDeleteRuleManager'
});
