(function process(env) {
    return !gs.nil(env.getObject().errorType) ? 'TrainingDataExtractionError' : 'TrainingDataBatch';
})(env);
