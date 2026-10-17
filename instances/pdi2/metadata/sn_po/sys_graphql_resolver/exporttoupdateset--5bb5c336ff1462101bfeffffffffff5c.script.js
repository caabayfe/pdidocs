(function process( /*ResolverEnvironment*/ env) {
    var params = {
        id: env.getArguments()['id'],
    };
    return new sn_po.ProminProcessConfigurationDefUtil().exportToUpdateset(params.id);
})(env);
