var EvtMgmtCustomIncidentPopulator = Class.create();
EvtMgmtCustomIncidentPopulator.prototype = {
    initialize: function() {
    },

    type: 'EvtMgmtCustomIncidentPopulator'
};

/*
 * Placeholder for custom script to assigne additional fields from the alert to the task being opened (by defualt to an incident). 
 * This script is called from the EvtMgmtIncidentHandler script include.
 * @param alert - alert
 * @param task - any derivitive of 'task', as defined by the rule, such as incident, problem, etc. By default this will be an incident.
 * @param rule - the rule that triggered creating the incident for the alert. It can be empty - in case of manual incident creation from alert
 * @return - true if task creation should be continued, false - if task creation should be aborted
 */
EvtMgmtCustomIncidentPopulator.populateFieldsFromAlert = function(alert, task, rule){
	// Usage example:
	// task.short_description += ' source: ' + alert.source;
	// return true;
};
