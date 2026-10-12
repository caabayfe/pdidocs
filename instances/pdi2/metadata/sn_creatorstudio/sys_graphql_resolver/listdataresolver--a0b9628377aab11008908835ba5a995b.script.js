(function process( /*ResolverEnvironment*/ env) {
    try {
        const {
            appSysID
        } = env.getArguments();
        if (!appSysID) {
            ListService.handleError('', ErrorService.ERROR_TYPES.BAD_REQUEST, 'appSysID is mandatory');
        }
        if (!ListService.canReadApp(appSysID)) {
            return ListService.handleError('', ErrorService.ERROR_TYPES.FORBIDDEN, gs.getMessage("User does not have permission to access application with id {0}", appSysID));
        }
        return ListService.getListByApplication(appSysID);
    } catch (e) {
        return e;
    }
})(env);
