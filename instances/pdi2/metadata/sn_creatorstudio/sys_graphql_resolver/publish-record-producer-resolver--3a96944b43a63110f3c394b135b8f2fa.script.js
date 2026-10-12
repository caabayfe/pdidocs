(function process(/*ResolverEnvironment*/ env) {
    if (!env.getArguments()) {
        return null;
    }
    const {
        sysId,
		options
    } = env.getArguments();
    try {
        return RecordProducerService.publishRecordProducer(sysId, options);
    } catch (e) {
        return e;
    }

})(env);
