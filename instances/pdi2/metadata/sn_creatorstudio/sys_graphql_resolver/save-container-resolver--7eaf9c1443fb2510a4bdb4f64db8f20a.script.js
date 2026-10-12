(function process( /*ResolverEnvironment*/ env) {
    const {
        payload
    } = env.getArguments();

    try {
        const container = QuestionContainerService.saveContainer(payload);
        return container;
    } catch (e) {
        return e;
    }

})(env);
