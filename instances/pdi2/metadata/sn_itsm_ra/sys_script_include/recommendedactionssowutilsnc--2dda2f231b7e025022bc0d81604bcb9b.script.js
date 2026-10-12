var RecommendedActionsSOWUtilSNC = Class.create();
RecommendedActionsSOWUtilSNC.prototype = {
    initialize: function() {},

    canViewRAPanel: function(tableName) {

        if (tableName == 'incident' || tableName == 'incident_task' || tableName == 'interaction') {
            return gs.hasRole('itil') || gs.hasRole('sn_incident_write');
        } else if (tableName == 'change_task' || tableName == 'change_request') {
            return gs.hasRole('itil') || gs.hasRole('sn_change_write');
        } else if (tableName == 'problem') {
            return gs.hasRole('itil') || gs.hasRole('sn_problem_write');
        } else if (tableName == 'problem_task') {
            return gs.hasRole('itil') || gs.hasRole('sn_problem_write') || gs.hasRole('problem_task_analyst');
        } else if (tableName == 'sc_request' || tableName == 'sc_req_item' || tableName == 'sc_task') {
            return gs.hasRole('itil') || gs.hasRole('sn_request_write');
        }
        return false;
    },

    type: 'RecommendedActionsSOWUtilSNC'
};
