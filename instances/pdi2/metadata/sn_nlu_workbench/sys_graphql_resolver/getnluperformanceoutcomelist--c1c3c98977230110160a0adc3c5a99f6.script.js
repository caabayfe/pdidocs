(function process( /*ResolverEnvironment*/ env) {
    try {
        var args = env.getArguments();
        var translatedLogMap = args.includeDynamicTranslation === 'false' ? new sn_nlu_workbench.NLUPerformanceUtil().getDynamicallyTranslatedLog() : {};

        var result = new sn_nlu_workbench.NLUPerformanceUtil().getPerformanceInfo(args.selectedIds, args.encodedQuery, translatedLogMap, args.offset, args.limit);
        return {
            status: 'success',
            data: result.data,
            count: result.count
        };
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }

})(env);
