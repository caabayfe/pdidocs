(function process( /*ResolverEnvironment*/ env) {
    // Returns all services in a request app
    const {
        requestAppId,
        filterConditions,
    } = env.getSource();
	const queryString = (filterConditions || {}).services;

    try {
        return RecordProducerService.getAllByRequestAppId(requestAppId, queryString);
    } catch (e) {
        return e;
    }

})(env);
