(function process( /*ResolverEnvironment*/ env) {
    try {
        const {
            appSysID,
            sysId,
        } = env.getArguments();
        return ListService.deleteFilteredList({
            appSysID,
            sysId
        });
    } catch (e) {
        return e;
    }
})(env);
