(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var data = request.body.data;

    try {
        if (data.modelId) {
            var isTrainAsync = GlideProperties.getBoolean('glide.mlpredictor.scheduled.nlu.model.training', false);

            if (isTrainAsync) {
                // flow designer action
                var inputs = {};
                inputs['modelsysid'] = data.modelId;
                var res = sn_fd.FlowAPI.getRunner().subflow('sn_nlu_studio.nlu_train_subflow').inBackground().withInputs(inputs).run();
                var contextId = res.getContextId();
                var flowResults = {};
                flowResults['contextId'] = contextId;
                flowResults['trainStatus'] = 'scheduled';
                response.setStatus(200);
                response.setContentType('application/json');
                return flowResults;
            } else {
                var result = NLUStudioTrainer.trainModel(data.modelId);
                if (result.status === 'success') {
                    response.setStatus(200);
                } else {
                    response.setStatus(400);
                }
                response.setContentType('application/json');
                return result;
            }

        } else {
            return new sn_ws_err.BadRequestError('No input data provided');
        }

    } catch (e) {
        return e;
    }

})(request, response);
