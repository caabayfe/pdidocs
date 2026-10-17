(function process( /*ResolverEnvironment*/ env) {
    var params = {
        table: env.getArguments()['table'],
        isContentPack: env.getArguments()['isContentPack'],
    };
    return new sn_po.ProminProcessConfigurationDefUtil().createProminProcessConfiguration(params.table, params.isContentPack);
})(env);
