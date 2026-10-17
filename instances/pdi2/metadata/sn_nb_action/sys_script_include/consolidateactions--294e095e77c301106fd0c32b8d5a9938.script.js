var ConsolidateActions = Class.create();
ConsolidateActions.prototype = Object.extendsObject(sn_nb_action.ConsolidateActionsImpl, {
    initialize: function() {
		ConsolidateActionsImpl.prototype.initialize.call(this);
    },

    type: 'ConsolidateActions'
});
