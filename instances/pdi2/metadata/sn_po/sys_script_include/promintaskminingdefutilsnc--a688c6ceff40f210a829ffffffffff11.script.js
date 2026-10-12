var ProminTaskMiningDefUtilSNC = Class.create();
ProminTaskMiningDefUtilSNC.prototype = {
    initialize: function() {},

    getTaskMiningProjectDetails: function(trackerId) {
        try {
            var responseJson = new global.ProminUtilsAJAX().getTaskMiningProjectDetails(trackerId);
            return {
                processMiningProjectId: responseJson.PROCESS_MINING_PROJECT_ID,
                trackerId: responseJson.TRACKER_ID,
                projectDescription: responseJson.PROJECT_DESCRIPTION,
				projectName: responseJson.PROJECT_NAME,
                status: responseJson.status,
                message: ''
            };
        } catch (error) {
            return {
                status: false,
                message: error
            };
        }
    },

    updateTaskMiningProjectId: function(usersCollectorTaskIdentifier, taskMiningProjectId) {
        try {
            new global.ProminUtilsAJAX().updateTaskMiningProjectId(usersCollectorTaskIdentifier, taskMiningProjectId);
            return {
                success: true,
                message: gs.getMessage("Updated task mining project Id")
            };

        } catch (error) {
            return {
                success: false,
                message: error
            };
        }
    },

    type: 'ProminTaskMiningDefUtilSNC'
};
