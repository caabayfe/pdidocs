(function process( /*ResolverEnvironment*/ env) {
    var params = {
        rootTable: env.getArguments()['rootTable'],
        field: env.getArguments()['field'],
    };
    return new sn_po.ProminProjectDefUtil().getDotwalkFieldPath(params.rootTable, params.field);
})(env);
