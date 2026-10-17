(function process( /*ResolverEnvironment*/ env) {
    var property = env.getArguments().propertyName;
    return gs.getProperty(property);
})(env);
