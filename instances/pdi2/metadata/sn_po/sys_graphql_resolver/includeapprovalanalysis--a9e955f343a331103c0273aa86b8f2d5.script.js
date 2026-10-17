(function process(/*ResolverEnvironment*/ env) {
	var params = {
        "approvalAnalysisPayload": env.getArguments()['approvalAnalysisPayload'],
    };
    var payload = JSON.parse(params.approvalAnalysisPayload);
	return new sn_po.ProminProjectDefUtil().includeApprovalAnalysis(payload);
})(env);
