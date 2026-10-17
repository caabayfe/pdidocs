(function process(/*ResolverEnvironment*/ env) {
    var params = {
        processId: env.getArguments()['processId'],
        fieldPayload: env.getArguments()['fieldPayload']
    };
	var payload = JSON.parse(params.fieldPayload);
    return new sn_po.ProminProcessConfigurationDefUtil().upsertControlFlowFieldMapping(params.processId, payload);
})(env);
