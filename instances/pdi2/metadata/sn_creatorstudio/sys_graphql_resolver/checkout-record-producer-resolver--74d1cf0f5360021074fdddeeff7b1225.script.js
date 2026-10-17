(function process(/*ResolverEnvironment*/ env) {
    if (!env.getArguments()) {
        return null;
    }
    const {
        sysId
    } = env.getArguments();
    try {
        return RecordProducerService.checkoutRecordProducer(sysId);
    } catch (e) {
        return e;
    }

})(env);
