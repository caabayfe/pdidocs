var RemoteTableData = Class.create();
(function() {
    RemoteTableData.GET_DATA_FROM_API_FLOW_ACTION = 'sn_deploy_pipeline.get_data_from_api';
    /**
     * Triggers a specified flow action to retrieve data from another instance
     * @param {String} instanceUrl - URL string of the instance
     * @param {Object} credentials - Reference to credential object in glide
     * @param {String} path - API route
     * @returns {Object} Rows from the specified table and instance
     */
    RemoteTableData.getInstanceDataFromFlowAction = function(instanceUrl, credentials, path) {

        var inputs = {
            instance_url: instanceUrl,
            credential: credentials,
            path: path
        };

        var actionResult = sn_fd.FlowAPI.getRunner()
            .action(RemoteTableData.GET_DATA_FROM_API_FLOW_ACTION)
            .inForeground()
            .withInputs(inputs)
            .run();

        return JSON.parse(actionResult.getOutputs().response_body).result;
    };

    RemoteTableData.prototype = {
        initialize: function() {
            throw 'Not supported';
        },
        type: 'RemoteTableData'
    };
})();
