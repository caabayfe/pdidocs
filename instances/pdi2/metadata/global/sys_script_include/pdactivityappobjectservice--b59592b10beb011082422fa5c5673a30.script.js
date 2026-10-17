var PDActivityAppObjectService = Class.create();
PDActivityAppObjectService.prototype = {
	initialize: function(appObjectRepo, activityRepo) {
		this.appObjectRepository = appObjectRepo || new PDActivityAppObjectRepository();
		this.activityRepository = activityRepo || new PDActivityRepository();
	},
	type: 'PDActivityAppObjectService',
	getActivityAppObjects: function(processDefinitionSysId) {
		if (!processDefinitionSysId)
			throw (gs.getMessage('Missing required parameter: processDefinitionSysId'));
		// get a list of activities by process definition id (=processDefinitionSysId id)
		var activities = this.activityRepository.getActivitiesByProcessDefinition(processDefinitionSysId);
		if (!Array.isArray(activities)) return [];
		var sysIds = activities.map(function(item) {
			return item.sys_id.value;
		});

		// get app objects by activity id
		var result = [];
		if (sysIds.length > 0) {
			result = this.appObjectRepository.getByActivities(sysIds);
		}

		return result;
	},
	insertActivityAppObjects: function(activityAppObjects) {
		return (activityAppObjects || []).map(function(activityAppObject) {
			return this.appObjectRepository.insertActivityAppObject(activityAppObject);
		}.bind(this));
	},
	deleteActivityAppObjects: function(activityAppObjects) {
		this.appObjectRepository.deleteActivityAppObjects(activityAppObjects || []);
		return null;
	}
};
