(function process( /*ResolverEnvironment*/ env) {

    if (UserUtil.hasDelegatedAccessAlone()) {
        return UserUtil.getScopeIdsAccessibleByDelegatedDev();
    } else {
        return [];
    }

})(env);
