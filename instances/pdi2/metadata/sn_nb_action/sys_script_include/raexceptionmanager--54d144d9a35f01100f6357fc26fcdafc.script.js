var RAExceptionManager = Class.create();
RAExceptionManager.prototype = {
    initialize: function(exceptionType, placeholders) {
        this.placeholders = placeholders;
        this.exceptionsMapper = {
            "INVALID_SCRIPT_INCLUDE": [40001, gs.getMessage("Invalid script include.")],
            "UNKNOWN_ERROR_OCCURED": [40002, gs.getMessage("Unknown error occurred.")],
            "INVALID_FLOW": [40001, gs.getMessage("Invalid flow.")],
            "INVALID_OR_INACIVE_FLOW": [40001, gs.getMessage("Invalid or inactive flow.")],
            "INVALID_FLOW_OUTPUT": [40001, gs.getMessage("Invalid flow output.")],
            "INVALID_DECISION_TABLE": [40001, gs.getMessage("Invalid Decision table.")],
            "INVALID_OR_INACTIVE_DECISION_TABLE": [40001, gs.getMessage("Invalid or inactive Decision table.")],
            "INVALID_TREND_DEFINITION_CONFIG": [40001, gs.getMessage("Invalid Trend definition configuration.")],
            "INVALID_SEARCH_API_RESPONSE": [40003, gs.getMessage("Error occurred while calling AI Search API.")],
            "INVALID_GENIUS_RESULT_RESPONSE": [40004, gs.getMessage("Error occurred while fetching Genius Results.")],
            "INVALID_SEARCH_RESULT_RESPONSE": [40005, gs.getMessage("Error occurred while fetching Search Results.")]
        };
        if (this.exceptionsMapper[exceptionType]) {
            this.exceptionType = exceptionType;
        } else {
            this.exceptionType = "UNKNOWN_ERROR_OCCURED";
        }
    },

    getCode: function() {
        return this.exceptionsMapper[this.exceptionType][0];
    },

    getMessage: function() {
        return gs.getEscapedMessage(this.exceptionsMapper[this.exceptionType][1], this.placeholders);
    },

    getJSON: function() {
        var exceptionDetails = {};
        exceptionDetails[sn_nb_action.Constants.ERROR_CODE] = this.getCode();
        exceptionDetails[sn_nb_action.Constants.ERROR_MESSAGE] = this.getMessage();
        return exceptionDetails;
    },

    type: 'RAExceptionManager'
};
