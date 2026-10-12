var ExecuteIssuesTabRecommendations = Class.create();
ExecuteIssuesTabRecommendations.prototype = {
    initialize: function(input) {
        this._recommendationTable = input.recommendationObj.table;
        this._recommendationIds = input.recommendationObj.recommendationIds;

        this._recommendationHandler = this._getRecommendationHandler();
    },

    _getRecommendationHandler: function() {
        switch(this._recommendationTable) {
            case 'global_custom_tables_recommendation':
                return new sn_sub_man.GlobalCustomTableRecommendationsHandler();
            case 'custom_applications_recommendation':
                return new sn_sub_man.CustomApplicationRecommendationsHandler();
            default: {
                const errorMessage = "Cannot perform subscription recommendation from table " + this._recommendationTable + " as it is not recognized.";
                throw new Error(errorMessage);
            }
        }
    },

    applyRecommendations: function() {
        if (this._recommendationHandler.hasDuplicateRecommendations(this._recommendationIds))
            return 'duplicates';
        return this._recommendationHandler.applyRecommendations(this._recommendationIds);
    },

    type: 'ExecuteIssuesTabRecommendations'
};
