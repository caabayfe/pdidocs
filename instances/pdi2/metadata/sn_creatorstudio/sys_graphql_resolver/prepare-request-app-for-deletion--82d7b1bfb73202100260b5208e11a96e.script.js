(function process( /*ResolverEnvironment*/ env) {

    const {
        payload
    } = env.getArguments();
    try {
        const {
            sysId
        } = payload;
        const requestApp = RequestAppService.prepareForDeletion(sysId);
        return requestApp;
    } catch (e) {
        return e;
    }

})(env);
