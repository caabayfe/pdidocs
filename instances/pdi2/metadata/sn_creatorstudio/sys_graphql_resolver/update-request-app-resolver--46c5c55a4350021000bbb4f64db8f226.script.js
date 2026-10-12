(function process( /*ResolverEnvironment*/ env) {

    const {
        payload
    } = env.getArguments();
    try {
        const {
            sysId
        } = payload;
        const requestApp = RequestAppService.updateRequestApp(sysId, payload);
        return requestApp;
    } catch (e) {
        return e;
    }

})(env);
