var RelateIncidentToProblem = Class.create();
RelateIncidentToProblem.prototype = {
    initialize: function() {},

    CONSTANTS: {
        PROBLEM_TABLE: "problem",
        PROBLEM_ID: "problem_id"
    },

    canRelateClosedIncident: function() {
        if (gs.hasRole("problem_coordinator") && gs.getProperty("problem.role.relate_closed_incidents") === "problem_coordinator")
            return true;
        return false;
    },

    getFixedQuery: function(parentTable, parentColumn) {
        if (parentTable + "" !== this.CONSTANTS.PROBLEM_TABLE || parentColumn !== this.CONSTANTS.PROBLEM_ID)
            return;
        var fixedQuery = parentColumn + "ISEMPTY";
        if (!this.canRelateClosedIncident())
            fixedQuery = "active=true^" + fixedQuery;
        return fixedQuery;
    },

    canRelateRecord: function(parentTable, relatedRecordGr, parentColumn) {
        if (parentTable + "" !== this.CONSTANTS.PROBLEM_TABLE)
            return;
        return (this.canRelateClosedIncident() || (relatedRecordGr.canWrite() && relatedRecordGr.getElement(parentColumn).canWrite()));
    },

    type: 'RelateIncidentToProblem'
};
