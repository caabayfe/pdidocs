(function process( /*ResolverEnvironment*/ env) {

    try {
        return {
            status: 'success',
            data: new sn_nlu_workbench.NLUExpertFeedbackUtil().getModelList()
        };
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }

})(env);
