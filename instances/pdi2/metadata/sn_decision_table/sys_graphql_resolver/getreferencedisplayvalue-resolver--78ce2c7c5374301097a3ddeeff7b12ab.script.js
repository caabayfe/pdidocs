(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;
        
    var arguments = env.getArguments();
    var tableName = arguments.tableName;
    var sysId = arguments.sysId;
    var gr = new GlideRecord(tableName);
    gr.get(sysId);

    return {
        type: "reference",
        displayValue: gr.getDisplayValue(),
        conditionSysId: arguments.conditionSysId,
        decisionSysId: arguments.decisionSysId
    };

})(env);
