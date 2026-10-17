(function process( /*ResolverEnvironment*/ env) {

    const {
        groupId,
        resultLimit,
        additionalQueryString
    } = env.getArguments();

    return ActivityService.getUsersByGroupId(groupId, resultLimit, additionalQueryString);

})(env);
