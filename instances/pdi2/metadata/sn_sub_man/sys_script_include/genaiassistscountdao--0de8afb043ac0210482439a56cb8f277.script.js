var GenAIAssistsCountDAO = Class.create();
GenAIAssistsCountDAO.prototype = {
    initialize: function() {},

    /**
     * Get Assists count by InstanceId
     */
    getCountsByInstanceId: function(instanceId) {
        return this.getCountsForInstanceIds([instanceId]).get(instanceId);
    },

    getCountsForInstanceIds: function(instanceIds) {
        const resultMap = new Map();
        if (instanceIds.length === 0)
            return resultMap;

        const grAssistsCounts = new GlideRecord('sn_entitlement_genai_assist_counts');
        grAssistsCounts.addQuery('instance_id', "IN", instanceIds);
        grAssistsCounts.query();

        while (grAssistsCounts.next()) {
            const result = {};
            result.total_display_value = grAssistsCounts.getDisplayValue('total_assists');
            result.accrual_time = grAssistsCounts.getValue(sn_entitlement.LicensingEngineConstants.ACCRUAL_TIME);
            resultMap.set(grAssistsCounts.getValue("instance_id"), result);
        }
        return resultMap;
    },
    type: 'GenAIAssistsCountDAO'
};
