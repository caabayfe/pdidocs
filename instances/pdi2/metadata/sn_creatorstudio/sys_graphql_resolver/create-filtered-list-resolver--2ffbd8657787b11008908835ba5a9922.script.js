(function process( /*ResolverEnvironment*/ env) {

    try {
        const {
            appSysID,
            payload
        } = env.getArguments();
        if (!ListService.canReadApp(appSysID)) {
            return ListService.handleError('', ErrorService.ERROR_TYPES.FORBIDDEN, gs.getMessage("User does not have permission to access application with id {0}", appSysID));
        }
        return ListService.createFilteredList(appSysID, payload);
    } catch (e) {
        return e;
    }
})(env);
