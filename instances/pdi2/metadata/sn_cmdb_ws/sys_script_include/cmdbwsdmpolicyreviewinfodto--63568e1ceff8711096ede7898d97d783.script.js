var CMDBWsDMPolicyReviewInfoDto = Class.create();
CMDBWsDMPolicyReviewInfoDto.prototype = Object.extendsObject(CMDBWsDMConstants, {
    /**
     * This class holds Policy review info, impacted row counts and task to be generated.
     * 
     */
    initialize: function () {
    },

    //Start: Properties to expose
    impacted_row_count: 0,
    generated_task_count: 0,
    //End: Properties to expose

    /**
     * Calculate impacted row counts and task to be generated based on the policy data filter and assignment type
     * Impacted row count: consider user defined data filter, excluded records and custom retirement definition.
     * Generated task count: is based on the Assignment type and max allowed record per task(task to ci count limit set per policy type)
     * @param {*} policyGr 
     */
    populate: function(policyGr) {
        var dataFilter = new CMDBWsDMPolicyDataFilterDto();
        dataFilter.populate(policyGr);
        if (gs.getProperty('sn_cmdb_ws.glide.cmdb.data.manager.ignore.record.counts', "false") != "false")
            this.impacted_row_count = 0;
        else
            this.impacted_row_count = this._getImpactedRowCount(policyGr, dataFilter);
			
        this.generated_task_count = this._calculateTaskToBeGenerated(policyGr, this.impacted_row_count, dataFilter);
    },

    _getImpactedRowCount: function (policyGr, dataFilter) {
        dataFilter.validate(policyGr);
        return CMDBWsDMUtil.getRowCount(dataFilter.table, dataFilter.list_filter, true);
    },

    _calculateTaskToBeGenerated: function (policyGr, rowCount, dataFilter) {
        var maxRecordPerTask = policyGr[this.POLICY.TYPE].getRefRecord().getValue(this.POLICY_TYPE.TASK_CI_COUNT_LIMIT);
        if (maxRecordPerTask <= 0)
            maxRecordPerTask = this.DEFAULT_TASK_CI_COUNT_LIMIT;

        var assignmentType = policyGr.getValue(this.POLICY.TASK_ASSIGNMENT_TYPE);
        var taskCount = 0;
        if (assignmentType == this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.SPECIFIC_USER ||
            assignmentType == this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.SPECIFIC_GROUP) {
            taskCount = Math.floor(rowCount / maxRecordPerTask) + (rowCount % maxRecordPerTask == 0 ? 0 : 1);
        } else if (assignmentType == this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.GROUP_FIELD ||
            assignmentType == this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.USER_FIELD) {
            var field = '';
            if (!gs.nil(policyGr[this.POLICY.TASK_MANAGEMENT_GROUP]) && policyGr[this.POLICY.TASK_MANAGEMENT_GROUP].element) {
                field = policyGr[this.POLICY.TASK_MANAGEMENT_GROUP].element + "";
            } else if (!gs.nil(policyGr[this.POLICY.TASK_MANAGEMENT_USER]) && policyGr[this.POLICY.TASK_MANAGEMENT_USER].element) {
                field = policyGr[this.POLICY.TASK_MANAGEMENT_USER].element + "";
            } else if (!gs.nil(policyGr[this.POLICY.TASK_MANAGEMENT_FIELD_PATH])) {
                field = policyGr[this.POLICY.TASK_MANAGEMENT_FIELD_PATH] + "";
            }
            // Bail out early if there's no field to run the agg call on
            if (!field)
                return taskCount;

            var grRecords = new GlideAggregate(dataFilter.table);
            grRecords.addEncodedQuery(dataFilter.list_filter, true);
            grRecords.addAggregate('COUNT', field);
            grRecords.query();
            while (grRecords.next()) {
                var groupRowCount = grRecords.getAggregate('COUNT', field);
                taskCount += Math.floor(groupRowCount / maxRecordPerTask) + (groupRowCount % maxRecordPerTask == 0 ? 0 : 1);
            }
        }
        return taskCount;
    },

    type: 'CMDBWsDMPolicyReviewInfoDto'
});
