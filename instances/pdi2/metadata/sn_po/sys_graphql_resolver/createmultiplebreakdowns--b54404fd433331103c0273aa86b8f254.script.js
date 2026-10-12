(function process( /*ResolverEnvironment*/ env) {
    var params = {
        entityId: env.getArguments()['entityId'],
        breakdownFields: env.getArguments()['breakdownFields'],
    };
    return new sn_po.ProminProjectDefUtil().createMultipleBreakdowns(params.entityId, params.breakdownFields);
})(env);
