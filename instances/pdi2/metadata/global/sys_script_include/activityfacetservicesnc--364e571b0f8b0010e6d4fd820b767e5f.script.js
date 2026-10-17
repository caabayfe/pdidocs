var ActivityFacetServiceSNC = Class.create();
ActivityFacetServiceSNC.prototype = {
	initialize: function(activitySubContext) {
		this.activityFacetDAO = new ActivityFacetDAO(activitySubContext);
	},

	getFacetsInfo: function(actContext, sysId, additionalParams) {
		if (!additionalParams)
			additionalParams = {};
		if ((additionalParams.startDate && !additionalParams.endDate) || (additionalParams.endDate && !additionalParams.startDate))
			return {
				"status": 400,
				"message": gs.getMessage("Please provide start_date and end_date")
			};
			
		if (additionalParams.startDate && additionalParams.endDate && additionalParams.startDate > additionalParams.endDate)
			return {
				"status": 400,
				"message": gs.getMessage("start date can not be ahead of end date")
			};
		var actContextInfo, errorObj = {
			"status": 400,
			"message": gs.getMessage("Make sure a valid activity context details are passed")
		};
		if (!actContext || !sysId)
			return errorObj;
		actContextInfo = this.activityFacetDAO.getActivityContextInfo(actContext, sysId);
		if (!actContextInfo)
			return errorObj;
		try {
			additionalParams['module'] = actContextInfo.module;
			var result = this.activityFacetDAO.getFacetsInfo(actContext, sysId, additionalParams);
			result.status = '200';
			return result;
		} catch (error) {
			return {
				"status": "400",
				"error": error.message
			};
		}
	},

	type: 'ActivityFacetServiceSNC'
};
