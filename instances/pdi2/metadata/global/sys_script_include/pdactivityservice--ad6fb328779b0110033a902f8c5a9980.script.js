var PDActivityService = Class.create();
PDActivityService.prototype = {
    initialize: function(opts) {
        this.repository = (opts && opts.repository) || new PDActivityRepository();
    },
    type: 'PDActivityService',
    getActivity: function(activityId, config) {
        return this.repository.getActivity(activityId, config);
    },
    getActivities: function(processDefinitionId, config) {
        return this.repository.getActivitiesByProcessDefinition(processDefinitionId, config);
    },
    insertActivities: function(activities, config) {
        return this.repository.insertActivities((activities || []), config)
    },
    updateActivities: function(activities, processSchemaVersion, config) {
        return this.repository.updateActivities((activities || []), processSchemaVersion, config);
    },
    deleteActivities: function(activityIds) {
        this.repository.deleteActivities((activityIds || []).join(','));
    }
};
