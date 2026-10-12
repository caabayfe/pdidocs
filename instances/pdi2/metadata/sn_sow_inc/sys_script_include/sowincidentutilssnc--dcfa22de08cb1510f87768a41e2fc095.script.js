var SOWIncidentUtilsSNC = Class.create();
SOWIncidentUtilsSNC.prototype = {
    initialize: function() {
		
	},

    getNewIncidentTaskLink: function(incidentGr) {
        if (!incidentGr || incidentGr.sys_id.nil())
            return null;
        return ("incident_task.do?sys_id=-1&sysparm_query=" + encodeURIComponent("incident=" + incidentGr.getUniqueValue()));
    },

    type: 'SOWIncidentUtilsSNC'
};
