(function process( /*ResolverEnvironment*/ env) {
    var params = {
        "slaBreachEntityPayload": env.getArguments()['slaBreachEntityPayload'],
    };
    var payload = JSON.parse(params.slaBreachEntityPayload);
    return new sn_po.ProminProjectDefUtil().createProminSlaBreachEntity(payload);
})(env);
