(function process(/*ResolverEnvironment*/ env) {
    var params = {
        adReportId: env.getArguments()['adReportId'],
    };
    return new sn_po.ProminProjectDefUtil().getAutomationDiscoveryIntentsByReportId(params.adReportId);

})(env);
