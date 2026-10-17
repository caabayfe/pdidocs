(function process( /*ResolverEnvironment*/ env) {
    var params = {
        sysId: env.getArguments()['sysId'],
        activityPayload: env.getArguments()['activityPayload'],
    };
    var payload = JSON.parse(params.activityPayload);
    return new sn_po.ProminProjectDefUtil().updateProminActivity(params.sysId, payload);
})(env);
