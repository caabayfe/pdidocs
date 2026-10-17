(function process( /*ResolverEnvironment*/ env) {
    var params = {
        id: env.getArguments()['id']
    };
    return new global.ProcessConfigurationViewFieldDefUtil().deleteProcessPerspectiveField(params.id);
})(env);
