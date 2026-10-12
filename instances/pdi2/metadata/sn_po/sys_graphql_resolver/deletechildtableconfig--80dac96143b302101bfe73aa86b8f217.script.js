(function process( /*ResolverEnvironment*/ env) {
    var params = {
        childConfigId: env.getArguments()['childConfigId'],
    };
    return new sn_po.ProminProcessConfigurationDefUtil().deleteChildTableConfig(params.childConfigId);
})(env);
