(function process(/*ResolverEnvironment*/ env) {

    var params = {
        encodedQuery: env.getArguments()['encodedQuery'],
    };
    return new sn_po.ProminPlaybookUtil().getPlaybookExecutionsCount(params.encodedQuery);

})(env);
