(function process(/*ResolverEnvironment*/ env) {
    if (!env.getArguments()) {
        return null;
    }
    const {
        sysId,
		requireTableMatch
    } = env.getArguments();
    try {
        return RecordProducerService.getRecordProducer(sysId, requireTableMatch);
    } catch (e) {
        return e;
    }
})(env);
