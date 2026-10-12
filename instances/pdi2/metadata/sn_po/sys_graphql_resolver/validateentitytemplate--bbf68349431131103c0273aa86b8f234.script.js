(function process( /*ResolverEnvironment*/ env) {
    var params = {
        entityPayload: env.getArguments()['entityPayload'],
		templateType: env.getArguments()['templateType'],
    };
    var payload = JSON.parse(params.entityPayload);
    return new sn_po.ProminProjectDefUtil().validateEntityTemplate(payload, params.templateType);
})(env);
