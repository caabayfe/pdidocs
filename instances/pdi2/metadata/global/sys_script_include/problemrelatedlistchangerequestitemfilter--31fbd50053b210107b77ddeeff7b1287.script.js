var ProblemRelatedListChangeRequestItemFilter = Class.create();
ProblemRelatedListChangeRequestItemFilter.prototype = {
    getFilterQuery: function() {
        return "active=true^parentISEMPTY";
    },

    handles: function(thing) {
        return thing == "PROBLEM_CHANGE_REQUEST_QUERY_FILTER";
    },

    type: 'ProblemRelatedListChangeRequestItemFilter'
};
