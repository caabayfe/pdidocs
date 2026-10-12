var RARecommenderHandler = Class.create();
RARecommenderHandler.prototype = Object.extendsObject(sn_gd_guidance.GuidanceRecommenderHandler, {
    initialize: function() {},
    /*
     * This method identifies the recommender that handles this implementation.
     *Should be "GuidanceHistory.recommender".
     */
    getId: function() {
        return sn_nb_action.Constants.TBL_ACTION_DETAIL;
    },
    /*
     * This method tells if the current Guidance can be acted upon.
     *It calls recommender system methods to decide if guidance has not been acted by another user for same context.
     */
    isGuidanceActionAllowed: function(recommendedBy) {
        var nbaService = new sn_nb_action.NextBestActionService();
        return nbaService.isRecommendationAllowed(recommendedBy);
    },

    /*
     * This method is utilized to decide whether to show or hide the dismiss button based on the recommendedBy.
     */
    getDismissButtonConfig: function(recommendedBy) {
        return true;
    },

    /*
     * This method checks if current user is valid user for executing guidance from RA or not
     */
    isUserValid: function(recommendedBy) {
        var gr = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_DETAIL);
        gr.get(recommendedBy);
        var contextId = gr[sn_nb_action.Constants.COL_CONTEXT];
        var contextgr = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_CONTEXT);
        contextgr.get(contextId);
        var createdByUser = contextgr[sn_nb_action.Constants.COL_USER];
        var curUser = gs.getUserID();
        return curUser == createdByUser;
    },

    type: 'RARecommenderHandler'
});
