var ProblemRelatedListIncidentItemFilter = Class.create();
ProblemRelatedListIncidentItemFilter.prototype = {
	CONSTANTS: {
		PROBLEM_TABLE: "problem",
		PROBLEM_ID: "problem_id"
	},

	getFilterQuery: function() {
		return new global.BulkAddRecords().getFixedQuery(this.CONSTANTS.PROBLEM_TABLE, this.CONSTANTS.PROBLEM_ID);
    },

	handles: function(thing) {
        return thing == "PROBLEM_INCIDENT_QUERY_FILTER";
    },

	type: 'ProblemRelatedListIncidentItemFilter'
};
