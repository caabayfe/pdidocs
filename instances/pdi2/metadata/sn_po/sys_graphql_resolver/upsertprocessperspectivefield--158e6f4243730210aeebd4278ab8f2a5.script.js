(function process( /*ResolverEnvironment*/ env) {
    var params = {
        processId: env.getArguments()['processId'],
        fieldPayload: env.getArguments()['fieldPayload']
    };
    return new global.ProcessConfigurationViewFieldDefUtil().upsertPerspectiveFied(params.processId, params.fieldPayload);
})(env);
