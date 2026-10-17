(function process( /*ResolverEnvironment*/ env) {

    const {
        payload
    } = env.getArguments();

    try {
        const container = QuestionContainerService.deleteContainer(payload);
        return container;
    } catch (e) {
        return e;
    }

})(env);
