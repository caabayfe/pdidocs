(function(context, pageParams, blockcontext) {

    var modelId = blockcontext.selectedModelDetails.modelId;

    try {
        if (modelId) {
            var isTrainAsync = GlideProperties.getBoolean('glide.mlpredictor.scheduled.nlu.model.training', false);

            if (isTrainAsync) {
                // flow designer action
                var inputs = {};
                inputs['modelsysid'] = modelId;
                var res = sn_fd.FlowAPI.getRunner().subflow('sn_nlu_studio.nlu_train_subflow').inBackground().withInputs(inputs).run();
                var contextId = res.getContextId();
                var flowResults = {};
                flowResults['contextId'] = contextId;
                flowResults['trainStatus'] = 'scheduled';
                return flowResults;
            } else {
                var result = NLUStudioTrainer.trainModel(data.modelId);
                return result;
            }

        } else {
            return new sn_ws_err.BadRequestError('No input data provided');
        }

    } catch (e) {
        return e;
    }
})(context, pageParams, blockcontext);
