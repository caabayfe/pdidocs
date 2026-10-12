(function process( /*ResolverEnvironment*/ env) {
    var params = {
        "activityPayload": env.getArguments()['activityPayload'],
    };
    var payload = JSON.parse(params.activityPayload);
    return new sn_po.ProminProjectDefUtil().createProminActivity(payload);
})(env);
