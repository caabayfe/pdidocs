(function process(/*ResolverEnvironment*/ env) {
    var params = {
        sysId: env.getArguments()['sysId'],
    };
    return new sn_po.ProminPlaybookUtil().deletePlaybook(params.sysId);

})(env);
