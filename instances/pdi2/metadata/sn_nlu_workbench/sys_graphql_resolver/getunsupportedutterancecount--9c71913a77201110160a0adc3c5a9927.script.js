(function process(/*ResolverEnvironment*/ env) {

    try {
        var args = env.getArguments();
        var incorrect = new sn_nlu_workbench.NLUPerformanceUtil().getAuditLogs('INCORRECT', args.encodedQuery).length;
        var noPrediction = new sn_nlu_workbench.NLUPerformanceUtil().getAuditLogs('NO_PREDICTION', args.encodedQuery).length;

        return {
            status: 'success',
            count: noPrediction + incorrect
        };
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }

})(env);
