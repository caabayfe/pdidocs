(function process( /*ResolverEnvironment*/ env) {
    var params = {
        sysId: env.getArguments()['sysId'],
        processConfigPayload: env.getArguments()['processConfigPayload'],
    };
    return new sn_po.ProminProcessConfigurationDefUtil().saveProcessConfig(params.sysId, params.processConfigPayload);

})(env);
