var DeduplicationTemplateScheduleService = Class.create();
DeduplicationTemplateScheduleService.prototype = {
    RECONCILE_TEMPLATE_TABLE: "reconcile_duplicate_template",
    RECONCILE_TEMPLATE_SCHEDULE_TABLE: "sn_cmdb_ws_reconcile_duplicate_template_schedule",
    RECONCILE_TEMPLATE_RUN_TABLE: "reconcile_duplicate_template_run",
    RUN_TYPE: 'run_type',
    RUN_DAYOFMONTH: 'run_dayofmonth',
    RUN_DAYOFWEEK: 'run_dayofweek',
    RUN_PERIOD: 'run_period',
    RUN_START: 'run_start',
    RUN_TIME: 'run_time',
    ENTERED_TIME: 'entered_time',
    TIME_ZONE: 'time_zone',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    PERIODICALLY: 'periodically',
    SCRIPT: 'script',
    SYS_ID: 'sys_id',
    ACTIVE: 'active',
    NAME: 'name',
    SCHEDULE: 'schedule',
    STATE: 'state',
    IN: 'IN',
    TEMPLATE: 'template',

    DEDUPLICATION_TEMPLATE_ERROR_SOURCE: 'sn_cmdb_ws_deduplication_template',

    ACTIONS: {
        GET_DEDUPLICATION_TEMPLATE: 'GET_DEDUPLICATION_TEMPLATE',
        CREATE_DEDUPLICATION_TEMPLATE_SCHEDULE: 'CREATE_DEDUPLICATION_TEMPLATE_SCHEDULE',
        UPDATE_DEDUPLICATION_TEMPLATE_SCHEDULE: 'UPDATE_DEDUPLICATION_TEMPLATE_SCHEDULE',
        GET_DEDUPLICATION_TEMPLATE_SCHEDULE: 'GET_DEDUPLICATION_TEMPLATE_SCHEDULE',
        DELETE_DEDUPLICATION_TEMPLATE_SCHEDULE: 'DELETE_DEDUPLICATION_TEMPLATE_SCHEDULE',
        ACTIVATE_DEDUPLICATION_TEMPLATE_SCHEDULE: 'ACTIVATE_DEDUPLICATION_TEMPLATE_SCHEDULE',
        VALIDATE_DEDUPLICATION_TEMPLATE_SCHEDULE_RUN_TYPE: 'VALIDATE_DEDUPLICATION_TEMPLATE_SCHEDULE_RUN_TYPE',
        VALIDATE_DEDUPLICATION_TEMPLATE: 'VALIDATE_DEDUPLICATION_TEMPLATE'
    },

    ERROR_CODES: {
        DEDUPLICATION_TEMPLATE_INVALID_RECORD: 'DEDUPLICATION_TEMPLATE_INVALID_RECORD',
        DEDUPLICATION_TEMPLATE_SCHEDULE_FAILED_INSERT: 'DEDUPLICATION_TEMPLATE_SCHEDULE_FAILED_INSERT',
        DEDUPLICATION_TEMPLATE_SCHEDULE_FAILED_UPDATE: 'DEDUPLICATION_TEMPLATE_SCHEDULE_FAILED_UPDATE',
        DEDUPLICATION_TEMPLATE_SCHEDULE_FAILED_DELETE: 'DEDUPLICATION_TEMPLATE_SCHEDULE_FAILED_DELETE',
        DEDUPLICATION_TEMPLATE_FAILED_UPDATE: 'DEDUPLICATION_TEMPLATE_FAILED_UPDATE',
        DEDUPLICATION_TEMPLATE_MISSING_RUN_TYPE: 'DEDUPLICATION_TEMPLATE_MISSING_RUN_TYPE',
        DEDUPLICATION_TEMPLATE_INVALID_RUN_TYPE: 'DEDUPLICATION_TEMPLATE_INVALID_RUN_TYPE',
        DEDUPLICATION_TEMPLATE_USER_MISSING_ROLE: 'DEDUPLICATION_TEMPLATE_USER_MISSING_ROLE',
        DEDUPLICATION_TEMPLATE_NOT_PUBLISHED: 'DEDUPLICATION_TEMPLATE_NOT_PUBLISHED',
        DEDUPLICATION_TEMPLATE_ONGOING_RUN: 'DEDUPLICATION_TEMPLATE_ONGOING_RUN'
    },

    TEMPLATE_STATES: {
        DRAFT: 'draft',
        READY: 'ready',
        RUNNING: 'running',
        CANCEL_REQUESTED: 'cancel_requested',
        PUBLISHED: 'published'
    },

    ROLE: {
        CMDB_DEDUP_ADMIN: 'cmdb_dedup_admin'
    },

    ALLOWED_RUN_TYPES: [],

    initialize: function () {
        this.ALLOWED_RUN_TYPES = [this.DAILY, this.WEEKLY, this.MONTHLY, this.PERIODICALLY];
    },

    createTemplateSchedule: function (templateId, fields) {
        if (!this._hasSchedulingPermission()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_USER_MISSING_ROLE,
                action: this.ACTIONS.CREATE_DEDUPLICATION_TEMPLATE_SCHEDULE,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user must have cmdb_dedup_admin role to create de-duplication template scheduled job"),
                details: "Required role: cmdb_dedup_admin to create de-duplication template scheduled job"
            });
        }

        this._validateTemplate(templateId);

        var runType = fields[this.RUN_TYPE];
        this._validateRunType(runType);

        // Cannot use GlideRecordSecure for template as maint is allowed to create/update templates
        var templateGr = this._getTemplateById(templateId);
        var scheduleJobGr = new GlideRecord(this.RECONCILE_TEMPLATE_SCHEDULE_TABLE);

        if (gs.nil(fields[this.ACTIVE])) {
            scheduleJobGr.setValue(this.ACTIVE, false);
        } else {
            scheduleJobGr.setValue(this.ACTIVE, fields[this.ACTIVE]);
        }
        var jobName = this._getName(templateGr.getValue(this.NAME));
        scheduleJobGr.setValue(this.NAME, jobName);
        scheduleJobGr.setValue(this.RUN_TYPE, fields[this.RUN_TYPE]);
        this._setSchedule(scheduleJobGr, runType, fields);
        scheduleJobGr.setValue(this.SCRIPT, 'sn_cmdb.DuplicateTemplate.runTemplate(\'' + templateId + '\');');

        var scheduleId;
        try {
            var scheduleId = scheduleJobGr.insert();
            if (gs.nil(scheduleId)) {
                var lastError = scheduleJobGr.getLastErrorMessage();
                throw new Error(lastError);
            }
        } catch (ex) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_SCHEDULE_FAILED_INSERT,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Failed to insert scheduled job for de-duplication template: {0}", {
                    0: templateGr.getValue(this.NAME)
                }),
                action: this.ACTIONS.CREATE_DEDUPLICATION_TEMPLATE_SCHEDULE,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                details: "Failed to insert scheduled job for de-duplication template: " + templateGr.getValue(this.NAME),
                logError: true,
                originalError: ex
            });
        }

        templateGr.setValue(this.SCHEDULE, scheduleId);
        if (!templateGr.update()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_FAILED_UPDATE,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                action: this.ACTIONS.CREATE_DEDUPLICATION_TEMPLATE_SCHEDULE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Failed to update de-duplication template: {0} with scheduled job reference: {1}", {
                    0: templateGr.getValue(this.NAME),
                    1: jobName
                }),
                details: "Failed to update de-duplication template: " + templateGr.getValue(this.NAME) + " with scheduled job reference: " + jobName,
                logError: true
            });
        }
        return scheduleId;
    },

    updateTemplateSchedule: function (scheduleId, fields) {
        if (!this._hasSchedulingPermission()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_USER_MISSING_ROLE,
                action: this.ACTIONS.UPDATE_DEDUPLICATION_TEMPLATE_SCHEDULE,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user must have cmdb_dedup_admin role to update de-duplication template scheduled job: {0}", {
                    0: scheduleId
                }),
                details: "Required role: cmdb_dedup_admin to update de-duplication template scheduled job: " + scheduleId
            });
        }

        this._validateTemplate(this._getTemplateByScheduleId(scheduleId));

        var runType = fields[this.RUN_TYPE];
        this._validateRunType(runType);

        var scheduleJobGr = this.getTemplateScheduleById(scheduleId);
        scheduleJobGr.setValue(this.RUN_TYPE, runType);
        this._setSchedule(scheduleJobGr, runType, fields);
        if (!scheduleJobGr.update()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_SCHEDULE_FAILED_UPDATE,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                action: this.ACTIONS.UPDATE_DEDUPLICATION_TEMPLATE_SCHEDULE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Failed to update de-duplication template scheduled job: {0}", {
                    0: scheduleId
                }),
                details: "Failed to update de-duplication template scheduled job: " + scheduleId,
                logError: true
            });
        }
    },

    getTemplateScheduleById: function (scheduleId) {
        var jobGr = new GlideRecord(this.RECONCILE_TEMPLATE_SCHEDULE_TABLE);

        if (!jobGr.canRead()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_USER_MISSING_ROLE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user must have cmdb_dedup_admin role to read de-duplication template scheduled job: {0}", {
                    0: scheduleId
                }),
                action: this.ACTIONS.GET_DEDUPLICATION_TEMPLATE_SCHEDULE,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                details: "Required role: cmdb_dedup_admin to read de-duplication template scheduled job: " + scheduleId
            });
        }

        if (!jobGr.get(scheduleId))
            throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_INVALID_RECORD,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Invalid de-duplication template scheduled job: {0}", {
                    0: scheduleId
                }),
                action: this.ACTIONS.GET_DEDUPLICATION_TEMPLATE_SCHEDULE,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                details: "Invalid de-duplication template scheduled job: " + scheduleId,
                logError: true
            });

        return jobGr;
    },

    activateTemplateSchedule: function(scheduleId, flag) {
        if (!this._hasSchedulingPermission()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_USER_MISSING_ROLE,
                action: this.ACTIONS.ACTIVATE_DEDUPLICATION_TEMPLATE_SCHEDULE,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user must have cmdb_dedup_admin role to update de-duplication template scheduled job: {0}", {
                    0: scheduleId
                }),
                details: "Required role: cmdb_dedup_admin to update de-duplication template scheduled job: " + scheduleId
            });
        }

        this._validateTemplate(this._getTemplateByScheduleId(scheduleId));

        var jobGr = this.getTemplateScheduleById(scheduleId);
        jobGr.setValue(this.ACTIVE, flag);
        if (!jobGr.update()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_SCHEDULE_FAILED_UPDATE,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                action: this.ACTIONS.ACTIVATE_DEDUPLICATION_TEMPLATE_SCHEDULE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Failed to activate de-duplication template scheduled job: {0}", {
                    0: scheduleId
                }),
                details: "Failed to activate de-duplication template scheduled job: " + scheduleId,
                logError: true
            });
        }
    },

    deleteTemplateSchedule: function(scheduleId) {
        if (!this._hasSchedulingPermission()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_USER_MISSING_ROLE,
                action: this.ACTIONS.DELETE_DEDUPLICATION_TEMPLATE_SCHEDULE,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user must have cmdb_dedup_admin role to delete de-duplication template scheduled job: {0}", {
                    0: scheduleId
                }),
                details: "Required role: cmdb_dedup_admin to delete de-duplication template scheduled job: " + scheduleId
            });
        }

        this._validateTemplate(this._getTemplateByScheduleId(scheduleId));

        var jobGr = this.getTemplateScheduleById(scheduleId);
        if (!jobGr.deleteRecord()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_SCHEDULE_FAILED_DELETE,
                action: this.ACTIONS.DELETE_DEDUPLICATION_TEMPLATE_SCHEDULE,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Failed to delete de-duplication template scheduled job: {0}", {
                    0: scheduleId
                }),
                details: "Failed to delete de-duplication template scheduled job: " + scheduleId,
                logError: true
            });
        }
    },

    _getTemplateById: function (templateId) {
        var templateGr = new GlideRecord(this.RECONCILE_TEMPLATE_TABLE);

        if (!templateGr.get(templateId))
            throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_INVALID_RECORD,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Invalid de-duplication template: {0}", {
                    0: templateId
                }),
                action: this.ACTIONS.GET_DEDUPLICATION_TEMPLATE,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                details: "Invalid de-duplication template: " + templateId,
                logError: true
            });

        return templateGr;
    },

    _getName: function (templateName) {
        var JOB_NAME_SUFFIX = " De-duplication Template Schedule";
        return templateName + JOB_NAME_SUFFIX;
    },

    _validateRunType: function (runType) {
        if (gs.nil(runType)) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_MISSING_RUN_TYPE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Cannot create/update de-duplication template schedule. Missing run type"),
                action: this.ACTIONS.VALIDATE_DEDUPLICATION_TEMPLATE_SCHEDULE_RUN_TYPE,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                details: "Cannot create/update de-duplication template schedule. Missing run type"
            });
        }
        if (this.ALLOWED_RUN_TYPES.indexOf(runType) == -1) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_INVALID_RUN_TYPE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Cannot create/update de-duplication template schedule. Invalid run type"),
                action: this.ACTIONS.VALIDATE_DEDUPLICATION_TEMPLATE_SCHEDULE_RUN_TYPE,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                details: "Cannot create/update de-duplication template schedule. Invalid run type"
            });
        }
    },

    _setSchedule: function (scheduleJobGr, runType, fields) {

        switch (runType) {
            case this.DAILY:
                this._setTime(scheduleJobGr, fields);
                break;
            case this.WEEKLY:
                this._setTime(scheduleJobGr, fields);
                scheduleJobGr.setValue(this.RUN_DAYOFWEEK, fields[this.RUN_DAYOFWEEK]);
                break;
            case this.MONTHLY:
                this._setTime(scheduleJobGr, fields);
                scheduleJobGr.setValue(this.RUN_DAYOFMONTH, fields[this.RUN_DAYOFMONTH]);
                break;
            case this.PERIODICALLY:
                if (!gs.nil(fields[this.RUN_PERIOD])) {
                    scheduleJobGr.setValue(this.RUN_PERIOD, fields[this.RUN_PERIOD]);
                } else {
                    throw new CMDBWsError({
                        code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_INVALID_RUN_TYPE,
                        message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Cannot create/update de-duplication template schedule. Missing repeat interval"),
                        action: this.ACTIONS.VALIDATE_DEDUPLICATION_TEMPLATE_SCHEDULE_RUN_TYPE,
                        source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                        details: "Cannot create/update de-duplication template schedule. Missing repeat interval"
                    });
                }
                if (!gs.nil(fields[this.RUN_START])) {
                    var gdtRunStart = new GlideDateTime();
                    gdtRunStart.setDisplayValue(fields[this.RUN_START]);
                    scheduleJobGr.setValue(this.RUN_START, gdtRunStart);
                }
                break;
            default:
                break;
        }
    },

    /**
     * Set the time for the scheduled job. If time_zone is selected, populate the entered time and run_time will be calculated automatically through a BR
     * Otherwise, populate the run_time and entered_time will be set to default.
     * @param scheduleJobGr
     * @param fields
     */
    _setTime: function(scheduleJobGr, fields) {
        if (!gs.nil(fields[this.TIME_ZONE])) {
            scheduleJobGr.setValue(this.TIME_ZONE, fields[this.TIME_ZONE]);
            scheduleJobGr.setValue(this.ENTERED_TIME, fields[this.ENTERED_TIME]);
        } else {
            // We need this because in case of a update scenario, there could be an existing time_zone and user has decided to not select time_zone anymore.
            scheduleJobGr.setValue(this.TIME_ZONE, "");

            var gtRunTime = new GlideTime();
            gtRunTime.setDisplayValue(fields[this.RUN_TIME]);
            scheduleJobGr.setValue(this.RUN_TIME, gtRunTime);
        }
    },

    _hasSchedulingPermission: function() {
        return gs.getUser().hasRole(this.ROLE.CMDB_DEDUP_ADMIN);
    },

    _validateTemplate: function(templateId) {
        if (!this._isPublishedTemplate(templateId)) {
			throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_NOT_PUBLISHED,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Cannot perform action on de-duplication template schedule. Template is not published"),
                action: this.ACTIONS.VALIDATE_DEDUPLICATION_TEMPLATE,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                details: "Cannot perform action on de-duplication template schedule. Template is not published"
            });
		}

		if (this._isOngoingTemplateRun(templateId)) {
			throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_ONGOING_RUN,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Cannot perform action on de-duplication template schedule. Template is currently running"),
                action: this.ACTIONS.VALIDATE_DEDUPLICATION_TEMPLATE,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                details: "Cannot perform action on de-duplication template schedule. Template is currently running"
            });
		}
    },

    _isPublishedTemplate: function(templateId) {
        var gr = new GlideRecord(this.RECONCILE_TEMPLATE_TABLE);
		if (gr.get(templateId)) {
			return gr.getValue(this.STATE) == this.TEMPLATE_STATES.PUBLISHED;
		}
		return false;
    },

    _isOngoingTemplateRun: function(templateId) {
        var templateRunStates = [this.TEMPLATE_STATES.DRAFT, this.TEMPLATE_STATES.READY, this.TEMPLATE_STATES.RUNNING, this.TEMPLATE_STATES.CANCEL_REQUESTED];

        var gr = new GlideRecord(this.RECONCILE_TEMPLATE_RUN_TABLE);
		gr.addQuery(this.TEMPLATE, templateId);
		gr.addQuery(this.STATE, this.IN, templateRunStates.join(','));
		gr.setLimit(1);
		gr.query();

		return gr.hasNext();
    },

    _getTemplateByScheduleId: function(scheduleId) {
        var gr = new GlideRecord(this.RECONCILE_TEMPLATE_TABLE);
        gr.addQuery(this.SCHEDULE, scheduleId);
        gr.setLimit(2);
        gr.query();

        if (gr.getRowCount() != 1) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_INVALID_RECORD,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Cannot find template by schedule. Schedule has none/multiple templates"),
                action: this.ACTIONS.GET_DEDUPLICATION_TEMPLATE,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                details: "Cannot find template by schedule. Schedule has none/multiple templates"
            });
        }

        gr.next();

        return gr.getValue(this.SYS_ID);
    },

    type: 'DeduplicationTemplateScheduleService'
};
