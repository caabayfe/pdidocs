var AppManagerIntegrationAPI = {
    makeAPIRequest: function(args) {
        if (Object.keys(args).length == 0)
            return;

        var apiRequest = new ScopedAppRepoRequest(args.apiName);
        Object.keys(args.params).forEach(function(key) {
            apiRequest.setParameter(key, args.params[key]);
        });
        var response = {};
        if (args.method.toLowerCase() == "get")
            response = apiRequest.get();
        else if (args.method.toLowerCase() == "post")
            response = apiRequest.post();
        if (apiRequest.getStatusCode().toString().startsWith("2")) { // Sucess Message code like 200, 201, 202. ... 
            response = new global.JSON().decode(response);
        } else {
            var error = {};
            error.errorCode = apiRequest.getStatusCode();
            error.errorDescription = "AppManagerIntegrationAPI.makeAPIRequest():Error occurred while processing request -" + JSON.stringify(args);
            error.errorAction = args.apiName;
            throw error;
        }
        return response;
    }
};
