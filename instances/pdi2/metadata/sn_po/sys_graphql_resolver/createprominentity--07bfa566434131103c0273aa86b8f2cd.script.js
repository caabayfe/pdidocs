(function process( /*ResolverEnvironment*/ env) {
    var params = {
        "entityPayload": env.getArguments()['entityPayload'],
    };
    var payload = JSON.parse(params.entityPayload);
    return new sn_po.ProminProjectDefUtil().createProminEntity(payload);
})(env);
