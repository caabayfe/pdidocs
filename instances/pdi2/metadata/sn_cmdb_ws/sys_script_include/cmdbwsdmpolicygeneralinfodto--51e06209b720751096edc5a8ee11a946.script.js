var CMDBWsDMPolicyGeneralInfoDto = Class.create();
CMDBWsDMPolicyGeneralInfoDto.prototype = Object.extendsObject(CMDBWsDMConstants, {
    /**
     * This class to hold Policy general info required for PolicyDto JSON object.
     * Note: If you add any new property in this class it will show up under PolicyDto object when we send it to UI
     * 
     */
    initialize: function () {
    },

    //Start: Properties to expose
    policy_name: "",
    description: "",
    cmdb_policy_type: "",
    cmdb_policy_type_name: "",
    work_notes: "",
    //End: Properties to expose

    populate: function (policyGr) {
        this.policy_name = policyGr.getValue(this.POLICY.NAME) + "";
        this.description = policyGr.getValue(this.POLICY.DESCRIPTION);
        this.cmdb_policy_type = policyGr.getValue(this.POLICY.TYPE);
        this.cmdb_policy_type_name = (CMDBWsDMUtil.getPolicyTypeInfo(this.cmdb_policy_type)).name;
        // Note: we can't read work_notes using GlideRecord. It can be read as activity stream
        //this.work_notes = policyGr.getValue(this.POLICY.WORK_NOTES);
    },

    validate: function (policyGr) {
        //name and type should not be empty
        var policyTypeId = policyGr.getValue(this.POLICY.TYPE);
        var policyName = policyGr.getValue(this.POLICY.NAME);
        var policyId = policyGr.getValue(this.SYS_ID);
        if (gs.nil(policyName))
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_POLICY_VALIDATION_ERR,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy Name is empty for policyId:{0}!", { 0: policyId }),
                action: this.ACTIONS.DM_VALIDATE_POLICY,
                source: this.DM_ERROR_SOURCE,
                details: "Policy name must not be empty"
            });
        else if (gs.nil(policyTypeId))
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_POLICY_VALIDATION_ERR,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws",  "Policy type is empty for policyId:{0}!", { 0: policyId }),
                action: this.ACTIONS.DM_VALIDATE_POLICY,
                source: this.DM_ERROR_SOURCE,
                details: "Policy type must not be empty"
            });
    },
    type: 'CMDBWsDMPolicyGeneralInfoDto'
});
