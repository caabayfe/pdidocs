(function process( /*ResolverEnvironment*/ env) {
    var actionId = env.getArguments().actionId;
    return DiagramActionArgumentsService.getArgumentsByActionId(actionId);
})(env);
