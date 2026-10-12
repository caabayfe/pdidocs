(function process( /*ResolverEnvironment*/ env) {

    const {
        payload
    } = env.getArguments();

    try {
        const catalogUIPolicy = RecordProducerService.deleteCatalogUIPolicies(payload);
        return catalogUIPolicy;
    } catch (e) {
        return e;
    }
	
})(env);
