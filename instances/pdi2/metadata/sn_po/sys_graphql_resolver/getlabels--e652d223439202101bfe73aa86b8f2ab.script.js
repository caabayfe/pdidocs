(function process( /*ResolverEnvironment*/ env) {
    var params = {
        labelsPayload: env.getArguments()['labelsPayload'],
    };
    return new sn_po.ProminProjectDefUtil().getLabels(params.labelsPayload);
})(env);
