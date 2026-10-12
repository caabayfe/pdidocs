var GuidanceRecommenderSystemFactory = Class.create();
GuidanceRecommenderSystemFactory.prototype = Object.extendsObject(sn_gd_guidance.GuidanceRecommenderHandler, {
    initialize: function() {},
    /*
     * This method identifies the recommender that handles this implementation.
     *Should be "GuidanceHistory.recommender".
     */
    getId: function() {
        //No OP needs to be implemented in extension.
    },
    /*
     * This method tells if the current Guidance can be acted upon.
     *It calls recommender system methods to decide if guidance has not been acted by another user for same context.
     */
    isGuidanceActionAllowed: function(recommendedBy) {
        return true;
    },

    /*
     * This method get the dismiss button configuration details
     */
    getDismissButtonConfig: function(recommendedBy) {
        // Returns true/false to hide or show the dismiss button
    },

    /*
     * This method checks if current user is valid user for executing guidance or not
     */
	isUserValid: function(recommendedBy) {
		return false;
	},

    type: 'GuidanceRecommenderSystemFactory'
});
