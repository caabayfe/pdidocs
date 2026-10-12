var CMDBWsDMPolicyDto = Class.create();
CMDBWsDMPolicyDto.prototype = Object.extendsObject(CMDBWsDMConstants, {
    /**
     * This class to hold Policy info JSON object.
     * We can use JSONUtil(JSON.stringify(), JSON.parse()) to serialize or deserialize object between UI and backend script.
    JSON Structure
        {
            policyId = "",
            status = "",
            updated_on = "",
            general_info = {
                name: "",
                description: "",
                cmdb_policy_type: "",
                cmdb_policy_type_name: "",
                work_notes: ""
            },
            data_filter = {
                table: "",
                encoded_query: "",
                enforced_condition: "",
                list_filter: ""
            },        
            assignment = {
                task_assignment_type: "",
                task_management_group: "",
                task_management_user: "",
                user_group: "",
                user: "",
				empty_assignment_action: "",
				empty_assignment_value: "",
            },
            options = {
                display_fields: "",
                certification_fields: "",
                instructions: "",
                task_due_in_days: 0,
                subflow: "",
                needs_review: false,
                archive_for_days: 0,
                allow_field_updates:true
            },
            schedule = {
                run_type: "", //Enum: Daily/ Weekly/ Monthly/Periodically/Once/ On Demand
                run_time: "",
                run_start: "",
                run_period: "",
                run_dayofweek: "",
                run_dayofmonth: "",
				run_user: ""
            }
        }
    */
    initialize: function (policyId) {
        this.policyId = policyId;
        this.general_info = new CMDBWsDMPolicyGeneralInfoDto();
        this.data_filter = new CMDBWsDMPolicyDataFilterDto();
        this.assignment = new CMDBWsDMPolicyAssignmentDto();
        this.options = new CMDBWsDMPolicyOptionsDto();
        this.schedule = new CMDBWsDMPolicyScheduleDto();
        this.status = ""; //draft/published/inactive/evaluation_failed
        this.updated_on = "";
    },

    populate: function () {
        var policyAccessor = new CMDBWsDMPolicyAccessor();
        var policyGr = policyAccessor.getPolicyById(this.policyId, true);

        //Populate general Info
        this.general_info.populate(policyGr);

        //Populate data filter and preview info
        this.data_filter.populate(policyGr);

        //Populate assignment info
        this.assignment.populate(policyGr);

        //Populate options
        this.options.populate(policyGr);

        //Populate schedule
        this.schedule.populate(policyGr);

        //Populate status
        var policyRuntimeAttGr = policyAccessor.getPolicyRuntimeAttribute(this.policyId);
        this.status = policyRuntimeAttGr.getValue(this.RUNTIME_ATTRIBUTE.STATUS);

        //Populate updated_on
        this.updated_on = policyGr.getValue(this.SYS_UPDATED_ON);
    },

    validate: function () {
        var policyAccessor = new CMDBWsDMPolicyAccessor();
        var policyGr = policyAccessor.getPolicyById(this.policyId, true);

        this.general_info.validate(policyGr);

        this.data_filter.validate(policyGr);

        this.assignment.validate(policyGr);

        this.options.validate(policyGr);

        this.schedule.validate(policyGr);
    },
    type: 'CMDBWsDMPolicyDto'
});
