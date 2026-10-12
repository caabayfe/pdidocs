(function process( /*ResolverEnvironment*/ env) {
    try {
        var instanceId = env.getArguments().instanceId;
        return DiagramBuilderInstanceService.deleteInstance(instanceId);
    } catch (ex) {
        return false;
    }
})(env);
