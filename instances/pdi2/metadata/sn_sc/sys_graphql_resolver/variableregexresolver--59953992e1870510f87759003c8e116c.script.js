(function process( /*ResolverEnvironment*/ env) {
    var questionId = env.getArguments().questionId;
    var value = env.getArguments().value;
    if (!GlideStringUtil.isEligibleSysID(questionId)) {
        return {
            result: false,
            errMsg: gs.getMessage("Question ID is not a valid sysId.")
        };
    }

    var question = GlideappQuestion.getQuestion(questionId);
    if (!question.canRead()) {
        return {
            result: false,
            errMsg: gs.getMessage("User is not authorized")
        };
    }
    var result = question.validateRegex(value);
    return {
        result: result,
        errMsg: result ? "" : gs.getMessage("Validation error: {0}", question.getValidationMessage())
    };

})(env);
