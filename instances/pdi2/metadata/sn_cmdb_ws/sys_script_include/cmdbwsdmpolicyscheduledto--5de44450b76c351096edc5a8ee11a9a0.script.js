var CMDBWsDMPolicyScheduleDto = Class.create();
CMDBWsDMPolicyScheduleDto.prototype = Object.extendsObject(CMDBWsDMConstants, {
    /**
     * This class to hold Policy Schedule info required for PolicyDto JSON object.
     * Note: If you add any new property in this class it will show up under PolicyDto object when we send it to UI
     * 
     */
    initialize: function () { },

    //Start: Properties to expose
    run_type: "", //Enum: Daily/ Weekly/ Monthly/Periodically/Once/ On Demand
    run_time: "",
    run_start: "",
    run_period: "",
    run_dayofweek: "",
    run_dayofmonth: "",
	run_user: "",
    //End: Properties to expose

    populate: function (policyGr) {
        var policyTypeId = policyGr.getValue(this.POLICY.TYPE);
        var typeInfo = CMDBWsDMUtil.getPolicyTypeInfo(policyTypeId);
        switch (typeInfo.name) {
            // populate schedule only for certification and attestation
            case this.OOB_POLICY_TYPES.CERTIFICATION.name:
            case this.OOB_POLICY_TYPES.ATTESTATION.name:
                var jobId = policyGr.getValue(this.POLICY.POLICY_EXECUTION_JOB);
                if(gs.nil(jobId))
                    break; // jobId can be null for draft policy
                var jobGr = new CMDBWsDMPolicyScheduleJobAccessor().getPolicyScheduledJobById(jobId);
                this.run_type = jobGr.getValue(this.POLICY_SCHEDULED_JOB.RUN_TYPE);
                this.run_time = jobGr.getDisplayValue(this.POLICY_SCHEDULED_JOB.RUN_TIME);
                this.run_time_display = this.run_time + "";
                this.run_start = jobGr.getDisplayValue(this.POLICY_SCHEDULED_JOB.RUN_START);
                this.run_period = jobGr.getValue(this.POLICY_SCHEDULED_JOB.RUN_PERIOD);
                this.run_period_display = jobGr.getDisplayValue(this.POLICY_SCHEDULED_JOB.RUN_PERIOD);
                this.run_dayofweek = jobGr.getValue(this.POLICY_SCHEDULED_JOB.RUN_DAYOFWEEK);
                this.run_dayofmonth = jobGr.getValue(this.POLICY_SCHEDULED_JOB.RUN_DAYOFMONTH);
				this.run_user = jobGr.getValue(this.POLICY_SCHEDULED_JOB.RUN_USER);
                break;
            default:
                break;
        }
    },

    validate: function (policyGr) {
        /* Perform following validation
         - only allow scheduleJobId if it is of type data cert or attestation.
        */
        var policyTypeId = policyGr.getValue(this.POLICY.TYPE);
        var typeInfo = CMDBWsDMUtil.getPolicyTypeInfo(policyTypeId);
        var jobId = policyGr.getValue(this.POLICY.POLICY_EXECUTION_JOB);
        var policyName = policyGr.getValue(this.POLICY.NAME);
        var policyId = policyGr.getUniqueValue();
        switch (typeInfo.name) {
            case this.OOB_POLICY_TYPES.CERTIFICATION.name:
            case this.OOB_POLICY_TYPES.ATTESTATION.name:
                // If policy is published jobId must be populated!
                var policyRuntimeAttGr = (new CMDBWsDMPolicyAccessor()).getPolicyRuntimeAttribute(policyId);
                var status = policyRuntimeAttGr.getValue(this.RUNTIME_ATTRIBUTE.STATUS);
                if (status == this.RUNTIME_ATTRIBUTE.STATUS_OPTIONS.PUBLISHED && gs.nil(jobId))
					throw new CMDBWsError({
						code: this.ERROR_CODES.DM_POLICY_VALIDATION_ERR,
						message: sn_i18n.Message.getMessage(this.CMDB_WS_SCOPE, "Policy scheduled job Id is missing for policy: {0}", {
							0: policyName
						}),
						action: this.ACTIONS.DM_VALIDATE_POLICY,
						source: this.DM_ERROR_SOURCE,
						details: "Policy schedued job Id is missing for policyId : " + policyId + ". Policy execution job field must be populated for all policies of type Certification and Attestation"
					});
                break;
            default:
                if (!gs.nil(jobId)) {
					throw new CMDBWsError({
						code: this.ERROR_CODES.DM_POLICY_VALIDATION_ERR,
						message: sn_i18n.Message.getMessage(this.CMDB_WS_SCOPE, "Invalid configuration found for policy: {0}", {
							0: policyName
						}),
						action: this.ACTIONS.DM_VALIDATE_POLICY,
						source: this.DM_ERROR_SOURCE,
						details: "Policy execution job Id is populated for policyId : " + policyId + ". Policy execution job field must be empty for all policies with type other than Certification or Attestation"
					});
                }
        }
    },

    type: 'CMDBWsDMPolicyScheduleDto'
});
