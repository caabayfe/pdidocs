(function process( /*ResolverEnvironment*/ env) {
    var params = {
        sysId: env.getArguments()['sysId'],
        entityPayload: env.getArguments()['entityPayload'],
    };
    var payload = JSON.parse(params.entityPayload);
    return new sn_po.ProminProjectDefUtil().updateProminEntity(params.sysId, payload);
})(env);
