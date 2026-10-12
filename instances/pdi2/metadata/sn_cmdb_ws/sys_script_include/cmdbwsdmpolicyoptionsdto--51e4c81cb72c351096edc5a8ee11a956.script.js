var CMDBWsDMPolicyOptionsDto = Class.create();
CMDBWsDMPolicyOptionsDto.prototype = Object.extendsObject(CMDBWsDMConstants, {
    /**
     * This class to hold Policy Options info required for PolicyDto JSON object.
     * Note: If you add any new property in this class it will show up under PolicyDto object when we send it to UI
     * 
     */
    initialize: function () { },

    //Start: Properties to expose
    display_fields: "",
    certification_fields: "",
    instructions: "",
    task_due_in_days: 0,
    subflow: "",
    needs_review: false,
    archive_for_days: 0,
    allow_empty_fields: true,
    allow_field_updates: true,
    //End: Properties to expose

    populate: function (policyGr) {
        var policyTypeId = policyGr.getValue(this.POLICY.TYPE);
        var typeInfo = CMDBWsDMUtil.getPolicyTypeInfo(policyTypeId);
        switch (typeInfo.name) {
            case this.OOB_POLICY_TYPES.CERTIFICATION.name:
                // populate display_fields, certification_fields, instructions, task_due_in_days, allow_empty_fields, allow_field_updates
                var policyCertGr = new CMDBWsDMPolicyAccessor().getCertificationPolicyById(policyGr.getUniqueValue());
                this.display_fields = policyCertGr.getValue(this.CERTIFICATION_POLICY.DISPLAY_FIELDS) ||  "";
                this.certification_fields = policyCertGr.getValue(this.CERTIFICATION_POLICY.CERTIFICATION_FIELDS) || "";
                this.instructions = policyCertGr.getValue(this.CERTIFICATION_POLICY.INSTRUCTIONS) || "";
                this.task_due_in_days = policyCertGr.getValue(this.POLICY.TASK_DUE_IN_DAYS);
                this.allow_empty_fields = global.JSUtil.getBooleanValue(policyCertGr, this.CERTIFICATION_POLICY.ALLOW_EMPTY_FIELDS);
                this.allow_field_updates = global.JSUtil.getBooleanValue(policyCertGr, this.CERTIFICATION_POLICY.ALLOW_FIELD_UPDATES);
                break;
            case this.OOB_POLICY_TYPES.DELETE.name:
            case this.OOB_POLICY_TYPES.RETIRE.name:
                // populate subflow and needs_review
                this.subflow = policyGr.getValue(this.POLICY.SUBFLOW_ID);
                this.needs_review = CMDBWsDMUtil.parseBoolean(policyGr.getValue(this.POLICY.NEEDS_REVIEW));
                break;
            case this.OOB_POLICY_TYPES.ARCHIVE.name:
                // populate subflow and needs_review and archive_for_days
                this.subflow = policyGr.getValue(this.POLICY.SUBFLOW_ID);
                this.needs_review = CMDBWsDMUtil.parseBoolean(policyGr.getValue(this.POLICY.NEEDS_REVIEW));
                this.archive_for_days = policyGr.getValue(this.POLICY.ARCHIVE_FOR_DAYS);
                break;
            case this.OOB_POLICY_TYPES.ATTESTATION.name:
                // populate task_due_in_days
                this.task_due_in_days = policyGr.getValue(this.POLICY.TASK_DUE_IN_DAYS);
                break;
            case this.OOB_POLICY_TYPES.DELETE_CMDB_RELATED_ENTRY.name:
                // populate subflow and needs_review
                this.subflow = policyGr.getValue(this.POLICY.SUBFLOW_ID);
                this.needs_review = CMDBWsDMUtil.parseBoolean(policyGr.getValue(this.POLICY.NEEDS_REVIEW));
                break;
            default:
                break;
        }
    },
    validate: function (policyGr) {
        /* TODO: Perform following validation
        - Make sure non allowed option value must be empty
        */
        var policyTypeId = policyGr.getValue(this.POLICY.TYPE);
        var typeInfo = CMDBWsDMUtil.getPolicyTypeInfo(policyTypeId);
        switch (typeInfo.name) {
            case this.OOB_POLICY_TYPES.CERTIFICATION.name:
                // except display_fields, certification_fields, instructions, task_due_in_days other options should have empty value
                break;
            case this.OOB_POLICY_TYPES.DELETE.name:
            case this.OOB_POLICY_TYPES.RETIRE.name:
                //except subflow and needs_review, other options should have empty value
                break;
            case this.OOB_POLICY_TYPES.ARCHIVE.name:
                //except subflow and needs_review and archive_for_days, other options should have empty value
                break;
            case this.OOB_POLICY_TYPES.ATTESTATION.name:
                // except task_due_in_days, other options should have empty value
                break;
            default:
                break;
        }
    },
    type: 'CMDBWsDMPolicyOptionsDto'
});
