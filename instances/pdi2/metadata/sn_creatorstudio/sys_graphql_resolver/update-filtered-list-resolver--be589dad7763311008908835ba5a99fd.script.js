(function process( /*ResolverEnvironment*/ env) {

    try {
        const {
            sysId,
            payload
        } = env.getArguments();
        return ListService.updateFilteredList({
            sysId,
            payload
        });
    } catch (e) {
        return e;
    }
})(env);
