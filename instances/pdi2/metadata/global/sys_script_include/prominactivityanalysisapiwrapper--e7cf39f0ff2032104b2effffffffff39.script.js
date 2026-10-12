var ProminActivityAnalysisApiWrapper = Class.create();
ProminActivityAnalysisApiWrapper.prototype = {
    initialize: function() {},

    scheduleClusteringRun: function(jsonPayload) {
        var activityAnalysisApi = new sn_icu.AgentActivityClusteringClient();
        var jsonObject = JSON.parse(jsonPayload);
        var response = activityAnalysisApi.scheduleClusteringRun(jsonObject);
        return response;
    },
	
    getClusteringResults: function(scheduledTaskId) {
        var activityAnalysisApi = new sn_icu.AgentActivityClusteringClient();
        var clusterResponse = activityAnalysisApi.getClusteringResults(scheduledTaskId);
        return clusterResponse;
    },
	
    type: 'ProminActivityAnalysisApiWrapper'
};
