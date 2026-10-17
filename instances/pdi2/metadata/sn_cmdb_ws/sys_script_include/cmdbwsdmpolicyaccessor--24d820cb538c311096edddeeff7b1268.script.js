var CMDBWsDMPolicyAccessor = Class.create();
CMDBWsDMPolicyAccessor.prototype = Object.extendsObject(CMDBWsDMConstants, {
    /**
     * This class will have all methods that does CRUD operation using GlideRecord on policy table
     */
    initialize: function() {},
    type: 'CMDBWsDMPolicyAccessor',

    /**
     * Get Policy by Id
     * @param {*} policyId 
     * @returns: Policy GlideRecord
     */
    getPolicyById: function(policyId, unsecure) {
        var policyGr = undefined;
        if (unsecure == true)
            policyGr = new GlideRecord(this.POLICY.TABLE);
        else
            policyGr = new GlideRecordSecure(this.POLICY.TABLE);

        if (unsecure == true && !policyGr.canRead()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_USER_MISSING_READ_ACL,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user does not have permission to read policy."),
                action: this.ACTIONS.DM_GET_POLICY,
                source: this.DM_ERROR_SOURCE,
                details: "No permission to read policy for policyId=" + policyId
            });
        }
        policyGr.get(policyId);
        if (!policyGr.isValidRecord())
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_INVALID_RECORD,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Invalid policyId:{0}", {
                    0: policyId
                }),
                action: this.ACTIONS.DM_GET_POLICY,
                source: this.DM_ERROR_SOURCE,
                details: "Invalid policyId=" + policyId
            });

        if (policyGr.getValue(this.POLICY.TYPE) == this.OOB_POLICY_TYPES.CERTIFICATION.sys_id)
            return this.getCertificationPolicyById(policyId, unsecure);

        return policyGr;
    },
    /**
     * Get Certification Policy by Id
     * @param {*} policyId
     * @returns: Policy GlideRecord
     */
    getCertificationPolicyById: function(policyId, unsecure) {
        var certPolicyGr = undefined;
        if (unsecure == true)
            certPolicyGr = new GlideRecord(this.CERTIFICATION_POLICY.TABLE);
        else
            certPolicyGr = new GlideRecordSecure(this.CERTIFICATION_POLICY.TABLE);

        if (unsecure == true && !certPolicyGr.canRead()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_USER_MISSING_READ_ACL,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user does not have permission to read certification policy."),
                action: this.ACTIONS.DM_GET_POLICY,
                source: this.DM_ERROR_SOURCE,
                details: "No permission to read certification policy for policyId=" + policyId
            });
        }
        certPolicyGr.get(policyId);
        if (!certPolicyGr.isValidRecord())
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_INVALID_RECORD,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Invalid certification policyId:{0}", {
                    0: policyId
                }),
                action: this.ACTIONS.DM_GET_POLICY,
                source: this.DM_ERROR_SOURCE,
                details: "Invalid certification policyId=" + policyId
            });

        return certPolicyGr;
    },

    getPolicyTypeById: function(policyTypeId, unsecure) {
        var policyTypeGr = undefined;
        if (unsecure == true)
            policyTypeGr = new GlideRecord(this.POLICY_TYPE.TABLE);
        else
            policyTypeGr = new GlideRecordSecure(this.POLICY_TYPE.TABLE);

        if (unsecure == true && !policyTypeGr.canRead()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_USER_MISSING_READ_ACL,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user does not have permission to read policy type"),
                action: this.ACTIONS.DM_GET_POLICY_TYPE,
                source: this.DM_ERROR_SOURCE,
                details: "No permission to read policy type:" + CMDBWsDMUtil.getPolicyTypeName(policyTypeId)
            });
        }
        policyTypeGr.get(policyTypeId);
        if (!policyTypeGr.isValidRecord())
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_INVALID_RECORD,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Invalid policyTypeId:{0}", {
                    0: policyId
                }),
                action: this.ACTIONS.DM_GET_POLICY_TYPE,
                source: this.DM_ERROR_SOURCE,
                details: "Invalid policyTypeId=" + policyTypeId
            });

        return policyTypeGr;
    },

    /**
     * Get Policy Runtime attribute for given policy Id
     * Note: For every policy there must be have only one runtime attribute record.
     * @param {*} policyId 
     * @returns: Policy Runtime Attribute GlideRecord
     */
    getPolicyRuntimeAttribute: function(policyId, unsecure) {
        var policyGr = this.getPolicyById(policyId); // validation for policy existence

        var policyRuntimeAttGr = undefined;
        if (unsecure == true)
            policyRuntimeAttGr = new GlideRecord(this.RUNTIME_ATTRIBUTE.TABLE);
        else
            policyRuntimeAttGr = new GlideRecordSecure(this.RUNTIME_ATTRIBUTE.TABLE);

        if (unsecure == true && !policyRuntimeAttGr.canRead()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_USER_MISSING_READ_ACL,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user does not have permission to read policy runtime attribute"),
                action: this.ACTIONS.DM_GET_POLICY_RUNTIME_ATTRIBUTE,
                source: this.DM_ERROR_SOURCE,
                details: "No permission to read policy runtime attribute for policyId=" + policyId
            });
        }

        policyRuntimeAttGr.addQuery(this.RUNTIME_ATTRIBUTE.POLICY, policyId);
        policyRuntimeAttGr.query();
        if (policyRuntimeAttGr.getRowCount() == 0)
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_INVALID_RECORD,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Runtime attribute record missing for the Policy:{0}", {
                    0: policyGr.getValue(this.POLICY.NAME)
                }),
                action: this.ACTIONS.DM_GET_POLICY_RUNTIME_ATTRIBUTE,
                source: this.DM_ERROR_SOURCE,
                details: "Runtime attribute record missing for policyId=" + policyId
            });
        else if (policyRuntimeAttGr.getRowCount() > 1)
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_INVALID_RECORD,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "More than one Runtime attribute record found for the Policy:{0}", {
                    0: policyGr.getValue(this.POLICY.NAME)
                }),
                action: this.ACTIONS.DM_GET_POLICY_RUNTIME_ATTRIBUTE,
                source: this.DM_ERROR_SOURCE,
                details: "More than one Runtime attribute record found for policyId=" + policyId
            });
        policyRuntimeAttGr.next();
        return policyRuntimeAttGr;
    },

    /**
     * Update Policy Status to published/ inactive/ draft/ evaluation failed
     * @param {*} policyId 
     * @param {*} status 
     * @returns 
     */
    updatePolicyStatus: function(policyId, status) {
        if (!CMDBWsDMUtil.hasPermissionToModifyPolicy()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_USER_MISSING_WRITE_ACL,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user does not have permission to update policy runtime attribute"),
                action: this.ACTIONS.DM_UPDATE_POLICY_RUNTIME_ATTRIBUTE,
                source: this.DM_ERROR_SOURCE,
                details: "No permission to update policy runtime attribute. Data manager admin role required"
            });
        }
        //Note: status column is read-only and we can only update its value via GlideRecord hence we are getting unsecure GR here.
        var policyRuntimeAttGr = this.getPolicyRuntimeAttribute(policyId, true);
        policyRuntimeAttGr.setValue(this.RUNTIME_ATTRIBUTE.STATUS, status);
        policyRuntimeAttGr.update();
        return policyRuntimeAttGr;
    },

    /**
     * Delete Policy
     * @param {*} policyId 
     */
    deletePolicy: function(policyId) {
        if (!CMDBWsDMUtil.hasPermissionToModifyPolicy()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_USER_MISSING_WRITE_ACL,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user does not have permission to delete policy"),
                action: this.ACTIONS.DM_DELETE_POLICY,
                source: this.DM_ERROR_SOURCE,
                details: "No permission to delete policy. Data manager admin role required"
            });
        }
        var policyGr = this.getPolicyById(policyId, true);
        var jobId = policyGr.getValue(this.POLICY.POLICY_EXECUTION_JOB);
        if(!gs.nil(jobId))
            new CMDBWsDMPolicyScheduleJobAccessor().deletePolicyScheduledJob(jobId);

        policyGr.deleteRecord();
    },

    /**
    * Delete the policies if the selected records are equal to or less than 10.
    * @param {*} encodedQuery
    * @param {*} runTimeAttrSysIds - sysids of policy runtime attribute table
    */
    deleteSelectedPolicies: function(encodedQuery, runTimeAttrSysIds) {
        var policySysIds = [];
        var grRuntimeAttr = new GlideRecord(this.RUNTIME_ATTRIBUTE.TABLE);
        if (global.JSUtil.notNil(encodedQuery)) {
            grRuntimeAttr.addEncodedQuery(encodedQuery, true);
        } else {
            grRuntimeAttr.addQuery(this.SYS_ID, this.QUERY_FILTERS.IN, runTimeAttrSysIds);
        }
        grRuntimeAttr.query();
        while (grRuntimeAttr.next()) {
            policySysIds.push(grRuntimeAttr.getValue(this.RUNTIME_ATTRIBUTE.POLICY));
        }
        if (policySysIds.length > 0) {
            this.deletePolicies(policySysIds);
        }
    },

    /**
    * Mark Policies for Deletion.
    * @param {*} encodedQuery
    * @param {*} runTimeAttrSysIds - sysids of policy runtime attribute table
    */
    markPoliciesForDeletion: function(encodedQuery, runTimeAttrSysIds) {
        var grRuntimeAttr = new GlideRecord(this.RUNTIME_ATTRIBUTE.TABLE);
        if (global.JSUtil.notNil(encodedQuery)) {
            grRuntimeAttr.addEncodedQuery(encodedQuery, true);
        } else {
            grRuntimeAttr.addQuery(this.SYS_ID, this.QUERY_FILTERS.IN, runTimeAttrSysIds);
        }
        grRuntimeAttr.query();
        grRuntimeAttr.setValue(this.RUNTIME_ATTRIBUTE.STATUS, this.RUNTIME_ATTRIBUTE.STATUS_OPTIONS.MARKED_FOR_DELETION);
        grRuntimeAttr.updateMultiple();
    },

    /**
    * Delete Policies that are Marked for Deletion
    */
    deletePoliciesMarkedForDeletion: function() {
        var policySysIds = [];
        var grRuntimeAttr = new GlideRecord(this.RUNTIME_ATTRIBUTE.TABLE);
        grRuntimeAttr.addQuery(this.RUNTIME_ATTRIBUTE.STATUS, this.RUNTIME_ATTRIBUTE.STATUS_OPTIONS.MARKED_FOR_DELETION);
        grRuntimeAttr.query();
        while (grRuntimeAttr.next()) {
            policySysIds.push(grRuntimeAttr.getValue(this.RUNTIME_ATTRIBUTE.POLICY));
        }
		if (policySysIds.length > 0) {
			this.deletePolicies(policySysIds);
		}
    },

    /**
    * Delete Policies
    * @param {*} policySysIds - sysids of policy table
    */
    deletePolicies: function(policySysIds) {
        if (!CMDBWsDMUtil.hasPermissionToModifyPolicy()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_USER_MISSING_WRITE_ACL,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user does not have permission to delete policies"),
                action: this.ACTIONS.DM_DELETE_POLICIES,
                source: this.DM_ERROR_SOURCE,
                details: "No permission to delete policy. Data manager admin role required"
            });
        }
        var grPolicy = new GlideRecordSecure(this.POLICY.TABLE);
        grPolicy.addQuery(this.SYS_ID, this.QUERY_FILTERS.IN, policySysIds);
        grPolicy.query();
        try {
            grPolicy.deleteMultiple();
        } catch (ex) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_FAILED_DELETE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy deletion failed for one or more sysIds"),
                action: this.ACTIONS.DM_DELETE_POLICIES,
                source: this.DM_ERROR_SOURCE,
                details: "Server side unexpected error occurred when deleting policies. See syslog for more details. Records being deleted " + policySysIds.join(","),
                logError: true,
                originalError: ex
            });
        }
    }
});
