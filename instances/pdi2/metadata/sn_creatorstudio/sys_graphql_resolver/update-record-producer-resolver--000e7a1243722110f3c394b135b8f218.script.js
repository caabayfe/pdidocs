(function process( /*ResolverEnvironment*/ env) {

    const {
        sysId,
        payload
    } = env.getArguments();

    try {
        const recordProducer = RecordProducerService.updateRecordProducer(sysId, payload);
        return recordProducer;
    } catch (e) {
        return e;
    }

})(env);
