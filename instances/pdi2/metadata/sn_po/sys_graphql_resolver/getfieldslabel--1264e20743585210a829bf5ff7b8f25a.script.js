(function process( /*ResolverEnvironment*/ env) {
    var params = {
        table: env.getArguments()['table'],
        fields: env.getArguments()['fields'],
    };
    return new sn_po.ProminProjectDefUtil().getFieldsLabel(params.table, params.fields);
})(env);
