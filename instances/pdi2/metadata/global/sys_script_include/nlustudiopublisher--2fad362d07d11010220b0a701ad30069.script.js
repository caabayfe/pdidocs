var NLUStudioPublisher = Class.create();

(function() {

    var constants = NLUConstants.constants;

    NLUStudioPublisher.canPublish = function(modelId) {
        var nluModel = new NLUModel(modelId);
        var modelStatusGr = nluModel.getStatus();
        if (modelStatusGr) {
            var trainedVersion = NLUHelper.getIntValue(modelStatusGr.getValue('trained_version'));
            var publishedVersion = NLUHelper.getIntValue(modelStatusGr.getValue('published_version'));
            return trainedVersion > 0 && trainedVersion > publishedVersion;
        }
        return false;
    };

    NLUStudioPublisher.publishModel = function(modelId) {
        var nluModel, modelGr, parloIntegrator,
            statusGr, output, trainedVersion, publishedVersion;
        var result = {};

        try {

            nluModel = new NLUModel(modelId);
            modelGr = nluModel.getGR();
            if (!modelGr) throw new Error(gs.getMessage('Model id does not exist'));

            statusGr = nluModel.getStatus();
            trainedVersion = statusGr.getValue('trained_version') ? parseInt(statusGr.getValue('trained_version')) : 0;
            publishedVersion = statusGr.getValue('published_version') ? parseInt(statusGr.getValue('published_version')) : 0;

            if (trainedVersion > 0) {
                if (publishedVersion > 0 && (trainedVersion <= publishedVersion)) {
                    result.status = 'failure';
                    result.message = gs.getMessage('Invalid trained version.');
                    return result;
                }

                parloIntegrator = new NLUParloIntegrator(modelGr);
                output = parloIntegrator.publish(trainedVersion);
                result.status = output.status;
                if (output.status === 'success') {
                    publishedVersion = output.response.solutionVersion;
                    result.publishedVersion = publishedVersion;

                    nluModel.updateStatus({
                        published_version: publishedVersion,
                        state: 'published',
                        last_published_on: (new GlideDateTime())
                    });
                } else if (output.status === 'failure') {
                    result.errors = NLUHelper.getErrorsFromResponse(output.response);
                }
            } else {
                result.status = 'failure';
                result.message = gs.getMessage('Invalid trained version.');
            }
        } catch (e) {
            result.status = 'failure';
            result.message = e.message;
        }
        return result;
    };

    NLUStudioPublisher.prototype = {
        type: 'NLUStudioPublisher',
        initialize: function() {}
    };
})();
