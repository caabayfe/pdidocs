(function process( /*ResolverEnvironment*/ env) {
    try {
        const {
            appSysID,
            payload
        } = env.getArguments();
        return ListService.reorderList({
            appSysID,
            payload
        });
    } catch (e) {
        return e;
    }
})(env);
