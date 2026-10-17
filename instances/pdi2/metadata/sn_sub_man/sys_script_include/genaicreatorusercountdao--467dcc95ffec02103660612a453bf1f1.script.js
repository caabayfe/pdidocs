var GenAICreatorUserCountDAO = Class.create();
GenAICreatorUserCountDAO.prototype = {
    initialize: function() {},

    /**
     * Get user counts by InstanceId
     */
    getCountsByInstanceId: function(instanceId) {
        return this.getCountsForInstanceIds([instanceId]).get(instanceId);
    },

    /**
     * Get user counts by InstanceIds
     */
    getCountsForInstanceIds: function(instanceIds) {
        const resultMap = new Map();
        if (instanceIds.length === 0)
            return resultMap;

        const gr = new GlideRecord('sn_entitlement_genai_creator_user_counts');
        gr.addQuery('instance_id', "IN", instanceIds);
        gr.query();
        while (gr.next()) {
            const result = {};
            result.total_display_value = gr.getDisplayValue('total_confirmed');
            resultMap.set(gr.getValue("instance_id"), result)
        }
        return resultMap;
    },
    type: 'GenAICreatorUserCountDAO'
};
