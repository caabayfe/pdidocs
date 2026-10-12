(function process( /*ResolverEnvironment*/ env) {
    if (!env.getArguments()) {
        return null;
    }
    const {
        payload,
        options
    } = env.getArguments();

    try {
        return RecordProducerService.generateAndPersistRequestForm(payload);
    } catch (e) {
        return e;
    }

})(env);
