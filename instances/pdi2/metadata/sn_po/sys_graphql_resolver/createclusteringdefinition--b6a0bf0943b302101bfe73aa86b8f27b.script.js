(function process( /*ResolverEnvironment*/ env) {
    var params = {
        table: env.getArguments()['table'],
        name: env.getArguments()['name'],
        fields: env.getArguments()['fields'],
    };
    return new sn_po.ProminProcessConfigurationDefUtil().createClusteringDefinition(params.table, params.name, params.fields);
})(env);
