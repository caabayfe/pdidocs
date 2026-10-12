var CMDBWsDMPolicyScheduleJobAccessor = Class.create();
CMDBWsDMPolicyScheduleJobAccessor.prototype = Object.extendsObject(CMDBWsDMConstants, {
    /**
     * This class will have all methods that does CRUD operation using GlideRecord on policy schedule table
     */
    initialize: function() {},
    type: 'CMDBWsDMPolicyScheduleJobAccessor',

    /**
     * Get Policy scheduled job by Id
     * @param {*} policyId
     * @returns: Policy GlideRecord
     */
    getPolicyScheduledJobById: function(jobId, unsecure) {
        var jobGr = undefined;
        if (unsecure == true)
            jobGr = new GlideRecord(this.POLICY_SCHEDULED_JOB.TABLE);
        else
            jobGr = new GlideRecordSecure(this.POLICY_SCHEDULED_JOB.TABLE);

        if (unsecure == true && !jobGr.canRead()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_USER_MISSING_READ_ACL,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user does not have permission to read policy scheduled job"),
                action: this.ACTIONS.DM_GET_POLICY_SCHEDULED_JOB,
                source: this.DM_ERROR_SOURCE,
                details: "No permission to read policy scheduled job=" + jobId
            });
        }

        jobGr.get(jobId);
        if (!jobGr.isValidRecord())
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_INVALID_RECORD,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Invalid policy scheduled jobId:{0}", {
                    0: jobId
                }),
                action: this.ACTIONS.DM_GET_POLICY_SCHEDULED_JOB,
                source: this.DM_ERROR_SOURCE,
                details: "Invalid policy scheduled jobId=" + jobId
            });

        return jobGr;
    },
    /**
    * Create Policy Schedule
    * Use GlideRecord to update policy record with policy schedule job id.
    * Policy execution job is a read only field and cannot be updated using GlideRecordSecure
    */
    createPolicySchedule: function(policyId, runType, runTime, runStart, runPeriod, runDayOfWeek, runDayOfMonth, runUser, active) {
        if (!CMDBWsDMUtil.hasPermissionToModifyPolicy()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_USER_MISSING_CREATE_ACL,
                action: this.ACTIONS.DM_CREATE_POLICY_SCHEDULE,
                source: this.DM_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user does not have permission to create policy scheduled job"),
                details: "No permission to create policy scheduled job"
            });
        }

        try {
            // Get the policy record
            var policyGr = new CMDBWsDMPolicyAccessor().getPolicyById(policyId, true);
            
            // Get policy name 
            var policyName = policyGr.getValue(this.POLICY.NAME);

            // Create a new scheduled job record
            var scheduleJobGr = new GlideRecord(this.POLICY_SCHEDULED_JOB.TABLE);
            scheduleJobGr.initialize();
            
            // Set active status with canWrite check
            if (scheduleJobGr.canWrite(this.POLICY_SCHEDULED_JOB.ACTIVE)) {
                scheduleJobGr.setValue(this.POLICY_SCHEDULED_JOB.ACTIVE, !gs.nil(active) ? active : false);
            }
            
            // Set name using the existing setName method
            this.setName(scheduleJobGr, policyName);
            
            // Set run type and user with canWrite checks
            if (scheduleJobGr.canWrite(this.POLICY_SCHEDULED_JOB.RUN_TYPE)) {
                scheduleJobGr.setValue(this.POLICY_SCHEDULED_JOB.RUN_TYPE, runType);
            }
            
            if (scheduleJobGr.canWrite(this.POLICY_SCHEDULED_JOB.RUN_USER)) {
                scheduleJobGr.setValue(this.POLICY_SCHEDULED_JOB.RUN_USER, runUser);
            }
            
            // Set the schedule
            this.setSchedule(scheduleJobGr, runType, runTime, runStart, runPeriod, runDayOfWeek, runDayOfMonth);
            
            // Set the script to execute the policy
            if (scheduleJobGr.canRead(this.POLICY_SCHEDULED_JOB.SCRIPT)) {
                scheduleJobGr.setValue(this.POLICY_SCHEDULED_JOB.SCRIPT, 'sn_cmdb_data_manager.CMDBDataManagerScopedScriptableApis.executePolicy("' + policyId + '");');
            }
            
            // Check create permission before inserting
            if (!scheduleJobGr.canCreate()) {
                throw new CMDBWsError({
                    code: this.ERROR_CODES.DM_USER_MISSING_CREATE_ACL,
                    action: this.ACTIONS.DM_CREATE_POLICY_SCHEDULE,
                    source: this.DM_ERROR_SOURCE,
                    message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user does not have permission to create policy scheduled job"),
                    details: "No canCreate permission for scheduled job"
                });
            }

            var sysId = scheduleJobGr.insert();
            if (gs.nil(sysId)) {
                var lastError = scheduleJobGr.getLastErrorMessage();
                throw new Error(lastError);
            }
            
            // Update the policy with job ID
            policyGr.setValue(this.POLICY.POLICY_EXECUTION_JOB, sysId);
            return policyGr.update();

        } catch (ex) {
            if (ex instanceof CMDBWsError)
                throw ex;
                
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_FAILED_INSERT,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy Schedule Job insert failed"),
                action: this.ACTIONS.DM_CREATE_POLICY_SCHEDULE,
                source: this.DM_ERROR_SOURCE,
                details: "Server side unexpected error occurred when inserting policy schedule job. See syslog for more details.",
                logError: true,
                originalError: ex
            });
        }
    },

    setName: function(scheduleJobGr, policyName) {
        var JOB_NAME_SUFFIX = " Policy Processor";
        if (scheduleJobGr.canWrite(this.POLICY_SCHEDULED_JOB.NAME)) {
            scheduleJobGr.setValue(this.POLICY_SCHEDULED_JOB.NAME, policyName + JOB_NAME_SUFFIX);
        }
    },

    setSchedule: function(scheduleJobGr, runType, runTime, runStart, runPeriod, runDayOfWeek, runDayOfMonth) {
        //clear out the current values if we have write permissions
        if (scheduleJobGr.canWrite(this.POLICY_SCHEDULED_JOB.RUN_TIME)) {
            scheduleJobGr.setValue(this.POLICY_SCHEDULED_JOB.RUN_TIME, "");
        }
        
        if (scheduleJobGr.canWrite(this.POLICY_SCHEDULED_JOB.RUN_START)) {
            scheduleJobGr.setValue(this.POLICY_SCHEDULED_JOB.RUN_START, "");
        }
        
        if (scheduleJobGr.canWrite(this.POLICY_SCHEDULED_JOB.RUN_PERIOD)) {
            scheduleJobGr.setValue(this.POLICY_SCHEDULED_JOB.RUN_PERIOD, "");
        }
        
        if (scheduleJobGr.canWrite(this.POLICY_SCHEDULED_JOB.RUN_DAYOFWEEK)) {
            scheduleJobGr.setValue(this.POLICY_SCHEDULED_JOB.RUN_DAYOFWEEK, "");
        }
        
        if (scheduleJobGr.canWrite(this.POLICY_SCHEDULED_JOB.RUN_DAYOFMONTH)) {
            scheduleJobGr.setValue(this.POLICY_SCHEDULED_JOB.RUN_DAYOFMONTH, "");
        }

        //set the start time always
        var gdtRunStart = new GlideDateTime();
        if(!gs.nil(runStart))
            gdtRunStart.setDisplayValue(runStart);
            
        if (scheduleJobGr.canWrite(this.POLICY_SCHEDULED_JOB.RUN_START)) {
            scheduleJobGr.setValue(this.POLICY_SCHEDULED_JOB.RUN_START, gdtRunStart);
        }

        var CONST = new CMDBWsDMConstants();
        switch (runType) {
            case CONST.POLICY_SCHEDULED_JOB.RUN_TYPE_VALUES.DAILY:
                var gtRunTime = new GlideTime();
                gtRunTime.setDisplayValue(runTime);
                if (scheduleJobGr.canWrite(this.POLICY_SCHEDULED_JOB.RUN_TIME)) {
                    scheduleJobGr.setValue(this.POLICY_SCHEDULED_JOB.RUN_TIME, gtRunTime);
                }
                break;
            case CONST.POLICY_SCHEDULED_JOB.RUN_TYPE_VALUES.WEEKLY:
                var gtRunTime = new GlideTime();
                gtRunTime.setDisplayValue(runTime);
                if (scheduleJobGr.canWrite(this.POLICY_SCHEDULED_JOB.RUN_TIME)) {
                    scheduleJobGr.setValue(this.POLICY_SCHEDULED_JOB.RUN_TIME, gtRunTime);
                }
                if (scheduleJobGr.canWrite(this.POLICY_SCHEDULED_JOB.RUN_DAYOFWEEK)) {
                    scheduleJobGr.setValue(this.POLICY_SCHEDULED_JOB.RUN_DAYOFWEEK, runDayOfWeek);
                }
                break;
            case CONST.POLICY_SCHEDULED_JOB.RUN_TYPE_VALUES.MONTHLY:
                var gtRunTime = new GlideTime();
                gtRunTime.setDisplayValue(runTime);
                if (scheduleJobGr.canWrite(this.POLICY_SCHEDULED_JOB.RUN_TIME)) {
                    scheduleJobGr.setValue(this.POLICY_SCHEDULED_JOB.RUN_TIME, gtRunTime);
                }
                if (scheduleJobGr.canWrite(this.POLICY_SCHEDULED_JOB.RUN_DAYOFMONTH)) {
                    scheduleJobGr.setValue(this.POLICY_SCHEDULED_JOB.RUN_DAYOFMONTH, runDayOfMonth);
                }
                break;
            case CONST.POLICY_SCHEDULED_JOB.RUN_TYPE_VALUES.PERIODICALLY:
                var gdtRunPeriod = new GlideDateTime("1970-01-01");
                gdtRunPeriod.addDaysUTC(runPeriod);
                if (scheduleJobGr.canWrite(this.POLICY_SCHEDULED_JOB.RUN_PERIOD)) {
                    scheduleJobGr.setValue(this.POLICY_SCHEDULED_JOB.RUN_PERIOD, gdtRunPeriod);
                }
                break;
            case CONST.POLICY_SCHEDULED_JOB.RUN_TYPE_VALUES.ONCE:
            case CONST.POLICY_SCHEDULED_JOB.RUN_TYPE_VALUES.ON_DEMAND:
            default:
                break;
        }
    },
	
    updatePolicySchedule: function(jobId, runType, runTime, runStart, runPeriod, runDayOfWeek, runDayOfMonth, runUser, policyId) {
        if (!CMDBWsDMUtil.hasPermissionToModifyPolicy()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_USER_MISSING_WRITE_ACL,
                action: this.ACTIONS.DM_UPDATE_POLICY_SCHEDULE,
                source: this.DM_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user does not have permission to update policy scheduled job"),
                details: "No permission to update policy scheduled job"
            });
        }
		var runtimeAttributeGr = this.getPolicyRuntimeAttributeById(policyId, true);
		runtimeAttributeGr.setValue(this.RUNTIME_ATTRIBUTE.RUN_AS, runUser);
		runtimeAttributeGr.update();

        var scheduleJobGr = this.getPolicyScheduledJobById(jobId, true);
        scheduleJobGr.setValue(this.POLICY_SCHEDULED_JOB.RUN_TYPE, runType);
		scheduleJobGr.setValue(this.POLICY_SCHEDULED_JOB.RUN_USER, runUser);
        this.setSchedule(scheduleJobGr, runType, runTime, runStart, runPeriod, runDayOfWeek, runDayOfMonth);
        return scheduleJobGr.update();

    },

	getPolicyRuntimeAttributeById: function(policyId, unsecure){
        var runtimeGr = undefined;
        if (unsecure == true)
            runtimeGr = new GlideRecord(this.RUNTIME_ATTRIBUTE.TABLE);
        else
            runtimeGr = new GlideRecordSecure(this.RUNTIME_ATTRIBUTE.TABLE);

        if (unsecure == true && !runtimeGr.canRead()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_USER_MISSING_READ_ACL,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user does not have permission to read runtime attribute records"),
                action: this.ACTIONS.DM_GET_POLICY_RUNTIME_ATTRIBUTE,
                source: this.DM_ERROR_SOURCE,
                details: "No permission to read runtime attribute record"
            });
        }

        runtimeGr.addQuery(this.RUNTIME_ATTRIBUTE.POLICY, policyId);
		runtimeGr.query();
        if (!runtimeGr.next())
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_INVALID_RECORD,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Invalid policy ID:{0}", {
                    0: policyId
                }),
                action: this.ACTIONS.DM_UPDATE_POLICY_RUNTIME_ATTRIBUTE,
                source: this.DM_ERROR_SOURCE,
                details: "Invalid policy ID=" + policyId
            });

        return runtimeGr;
    },

    /**
     * Activate policy schedule job when we publish the policy
     * @param {*} jobId 
     */
    activatePolicyScheduledJob: function(jobId, flag) {
        if (!CMDBWsDMUtil.hasPermissionToModifyPolicy()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_USER_MISSING_WRITE_ACL,
                action: this.ACTIONS.DM_PUBLISH_POLICY,
                source: this.DM_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user does not have permission to update policy scheduled job"),
                details: "No permission to update policy scheduled job"
            });
        }

        var jobGr = this.getPolicyScheduledJobById(jobId, true);
        jobGr.setValue(this.POLICY_SCHEDULED_JOB.ACTIVE, flag);
        if (!jobGr.update()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_FAILED_UPDATE,
                source: this.DM_ERROR_SOURCE,
                action: this.ACTIONS.DM_PUBLISH_POLICY,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Fail to activate policy scheduled job"),
                details: "Fail to activate policy scheduled job"
            });
        }
    },

    /**
     * Delete policy schedule job when user either changes the policy type or delete the policy
     * @param {*} jobId 
     */
    deletePolicyScheduledJob: function(jobId) {
        if (!CMDBWsDMUtil.hasPermissionToModifyPolicy()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_USER_MISSING_DELETE_ACL,
                action: this.ACTIONS.DM_DELETE_POLICY_SCHEDULE,
                source: this.DM_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user does not have permission to delete policy scheduled job"),
                details: "No permission to delete policy scheduled job"
            });
        }
        var jobGr = this.getPolicyScheduledJobById(jobId, true);
        if (!jobGr.deleteRecord()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_FAILED_DELETE,
                action: this.ACTIONS.DM_DELETE_POLICY_SCHEDULE,
                source: this.DM_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Fail to delete policy scheduled job"),
                details: "Fail to delete policy scheduled job"
            });
        }
    },
});
