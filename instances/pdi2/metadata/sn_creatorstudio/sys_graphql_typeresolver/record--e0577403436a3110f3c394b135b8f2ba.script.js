(function process(/*TypeResolutionEnvironment*/ env) {

    return 'errorType' in env.getObject() ? 'Error' : 'PublishedRecordProducer';

})(env);
