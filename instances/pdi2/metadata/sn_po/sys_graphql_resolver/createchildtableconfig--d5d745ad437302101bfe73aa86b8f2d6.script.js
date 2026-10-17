(function process( /*ResolverEnvironment*/ env) {
    var params = {
        processDefId: env.getArguments()['processDefId'],
        table: env.getArguments()['table'],
        sourceField: env.getArguments()['sourceField'],
        targetField: env.getArguments()['targetField'],
    };
    return new sn_po.ProminProcessConfigurationDefUtil().createChildTableConfig(params.processDefId, params.table, params.sourceField, params.targetField);
})(env);
