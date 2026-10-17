(function process( /*ResolverEnvironment*/ env) {
    var regexId = env.getArguments().regexId;
    var value = env.getArguments().value;
    if (!gs.hasRole('catalog_builder_editor')) throw gs.getMessage("User does not have access");
    if (global.JSUtil.notNil(value) && global.JSUtil.notNil(regexId)) {
        var response = GlideappQuestion.validateRegexForValue(regexId, value);
        return {
            result: response.valid,
            errMsg: gs.getMessage("Validation error: {0}", response.message)
        };
    }

    return {
        result: true,
        errMsg: ""
    };
})(env);
