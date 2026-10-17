(function process( /*ResolverEnvironment*/ env) {
    var params = {
        childConfigId: env.getArguments()['childConfigId'],
        sourceField: env.getArguments()['sourceField'],
    };
    return new sn_po.ProminProcessConfigurationDefUtil().updateChildTableConfig(params.childConfigId, params.sourceField);
})(env);
