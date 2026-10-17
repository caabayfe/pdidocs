(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        var nluModel = new NLUModel(request.pathParams.modelId);
        var modelGr = nluModel.getGR();
        var lastTrainingCompleted = true,
            latestVersion = 0,
            lastPublishedBy;
        if (modelGr) {
            var parloIntegrator = new NLUParloIntegrator(modelGr);
            var solution = null;
            try {
                solution = parloIntegrator.getSolution();
                latestVersion = solution.getLatestVersion();
                var status = latestVersion.getStatus();
                lastTrainingCompleted = status && JSON.parse(status)['hasJobEnded'];
                latestVersion = latestVersion.getVersionNumber();
            } catch (e) {
                gs.info('There is no latest version for for: ' + request.pathParams.modelId);
				latestVersion = 0;
            }
            try {
                if (solution) {
                    var activeVersion = solution.getActiveVersion();
                    var props = activeVersion.getProperties();
                    lastPublishedBy = NLUSystemUtil.getUserName(JSON.parse(props)['sys_created_by']);
                }
            } catch (e) {
                gs.info('There is no published version for for: ' + request.pathParams.modelId);
            }
        }

        response.setStatus(200);
        response.setContentType('application/json');
        return {
            lastTrainingCompleted: lastTrainingCompleted,
            latestVersion: latestVersion,
            lastPublishedBy: lastPublishedBy
        };
    } catch (e) {
        return e;
    }

})(request, response);
