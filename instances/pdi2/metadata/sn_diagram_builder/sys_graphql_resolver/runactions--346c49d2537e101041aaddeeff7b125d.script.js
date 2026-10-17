(function process( /*ResolverEnvironment*/ env) {
    try {
        var diagramJSON = env.getArguments().diagramJSON;
        var actionId = env.getArguments().actionId;
        var instanceId = env.getArguments().instanceId;
        return new RunDiagramActions(actionId).runAction(diagramJSON, instanceId);
    } catch (ex) {
        return false;
    }
})(env);
