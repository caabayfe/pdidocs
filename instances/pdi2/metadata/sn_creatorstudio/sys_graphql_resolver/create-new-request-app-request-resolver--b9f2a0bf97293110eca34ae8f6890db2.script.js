(function process(/*ResolverEnvironment*/ env) {

    const {
        payload
    } = env.getArguments();

    try {
        const newRequestAppRequest = RequestNewRequestAppService.create(payload);

        return newRequestAppRequest;
    } catch (e) {
        return e;
    }

})(env);
