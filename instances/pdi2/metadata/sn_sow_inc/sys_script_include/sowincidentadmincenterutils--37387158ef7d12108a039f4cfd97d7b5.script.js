var SOWIncidentAdminCenterUtils = Class.create();
SOWIncidentAdminCenterUtils.prototype = {
    initialize: function() {
    },

    updateCloseInteractionProp: function(closeInteractionProp) {

        var response = null;
        if (!gs.hasRole("sn_sow_interaction.sn_interaction_sow_admin"))
            return response;
        var gr = new GlideRecord('sys_properties');
        gr.addQuery('name', 'sn_sow_inc.autoclose_origin.interaction');
        gr.query();
        if (gr.next()) {
            gr.setValue('value', closeInteractionProp);
            response = gr.update();
        }
        return response;
    },

    type: 'SOWIncidentAdminCenterUtils'
};
