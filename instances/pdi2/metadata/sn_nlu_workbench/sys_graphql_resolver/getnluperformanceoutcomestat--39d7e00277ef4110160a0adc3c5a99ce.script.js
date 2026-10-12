(function process( /*ResolverEnvironment*/ env) {
    try {
        var args = env.getArguments();
        var translatedLogMap = args.includeDynamicTranslation === 'false' ? new sn_nlu_workbench.NLUPerformanceUtil().getDynamicallyTranslatedLog() : {};
        
        var singleCorrect = new sn_nlu_workbench.NLUPerformanceUtil().getAuditLogs('SINGLE_CORRECT', args.encodedQuery, translatedLogMap).length;
        var correctAmongMultiple = new sn_nlu_workbench.NLUPerformanceUtil().getAuditLogs('CORRECT_AMONG_MULTIPLE', args.encodedQuery, translatedLogMap).length;
        var singleIncorrect = new sn_nlu_workbench.NLUPerformanceUtil().getAuditLogs('SINGLE_INCORRECT', args.encodedQuery, translatedLogMap).length;
        var incorrectAmongMultiple = new sn_nlu_workbench.NLUPerformanceUtil().getAuditLogs('INCORRECT_AMONG_MULTIPLE', args.encodedQuery, translatedLogMap).length;
        var noPrediction = new sn_nlu_workbench.NLUPerformanceUtil().getAuditLogs('NO_PREDICTION', args.encodedQuery, translatedLogMap).length;
        var singleUnknown = new sn_nlu_workbench.NLUPerformanceUtil().getAuditLogs('SINGLE_UNKNOWN', args.encodedQuery, translatedLogMap).length;
        var unsupported = noPrediction + singleIncorrect + incorrectAmongMultiple;

        return {
            status: 'success',
            data: {
                singleCorrect: singleCorrect,
                correctAmongMultiple: correctAmongMultiple,
                singleIncorrect: singleIncorrect,
                incorrectAmongMultiple: incorrectAmongMultiple,
                noPrediction: noPrediction,
                singleUnknown: singleUnknown,
                unsupported: unsupported,
            }
        };
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }

})(env);
