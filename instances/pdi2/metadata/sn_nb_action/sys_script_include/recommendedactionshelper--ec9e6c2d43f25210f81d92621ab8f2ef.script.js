var RecommendedActionsHelper = Class.create();
RecommendedActionsHelper.prototype = {
    initialize: function() {},

    deleteSearchResultMapping: function(searchResultMappingGR) {
        if (gs.hasRole('sn_nb_action.next_best_action_author')) {
            searchResultMappingGR.deleteMultiple();
        }
    },

    type: 'RecommendedActionsHelper'
};
