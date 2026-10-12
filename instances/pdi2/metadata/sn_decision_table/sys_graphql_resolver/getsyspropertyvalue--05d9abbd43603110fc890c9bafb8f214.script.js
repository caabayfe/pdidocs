(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;

    return DecisionTableUtil.getSysPropertyValue(env.getArguments().sys_property_name, env.getArguments().default_value);
})(env);
