(function process( /*ResolverEnvironment*/ env) {
    const {
        payload,
        isAppCountRequired
    } = env.getArguments();
    try {
        const result = ApplicationService.getApplications(payload);

        if (isAppCountRequired) {
            result.applicationsCount = ApplicationService.getApplicationsCount(payload);
        }
        return result;
    } catch (e) {
        return e;
    }
})(env);
