var GuidanceRecommenderHandler = Class.create();
GuidanceRecommenderHandler.prototype = {
    initialize: function() {},
    /*
     * This method identifies the recommender that handles this implementation.
     *Should be "GuidanceHistory.recommender".
     */
    getId: function() {
        // No Op, needs to be implemented in extension.
    },
    /*
     * This method tells if the current Guidance can be acted upon.
     *It calls recommender system methods to decide if guidance has not been acted by another user for same context.
     */
    isGuidanceActionAllowed: function(recommender, recommendedBy) {
        return true;
    },

    /*
     * This method get the dismiss button configuration details
     */
    getDismissButtonConfig: function(recommendedBy) {
        return true;
    },

    type: 'GuidanceRecommenderHandler'
};
