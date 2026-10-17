var SOWInteractionAdminCenterUtils = Class.create();
SOWInteractionAdminCenterUtils.prototype = {
    initialize: function() {},

    updateNumberOfDays: function(days) {

        var response = null;
        if (!gs.hasRole("sn_sow_interaction.sn_interaction_sow_admin"))
            return response;
        var gr = new GlideRecord('sys_properties');
        gr.addQuery('name', 'sn_sow_interaction.requester_info_task_query_day_range');
        gr.query();
        if (gr.next()) {
            gr.setValue('value', days);
            response = gr.update();
        }
        return response;
    },

    type: 'SOWInteractionAdminCenterUtils'
};
