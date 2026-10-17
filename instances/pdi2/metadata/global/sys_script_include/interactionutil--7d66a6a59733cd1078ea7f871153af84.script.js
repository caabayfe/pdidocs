var InteractionUtil = Class.create();
InteractionUtil.prototype = {
    initialize: function() {},

    updateInteractionDuration: function(interactionId, durationInSeconds) {
		var date = new GlideDateTime('1970-01-01');
		date.addSeconds(durationInSeconds);
        var interaction_Gr = new GlideRecord('interaction');
		
        if (interaction_Gr.get(interactionId)) {
            interaction_Gr.setValue('duration', date.getValue());
            interaction_Gr.update();
        }
    },

    type: 'InteractionUtil'
};
