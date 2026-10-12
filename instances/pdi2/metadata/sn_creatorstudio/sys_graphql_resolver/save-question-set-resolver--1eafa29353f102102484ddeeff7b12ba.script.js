(function process( /*ResolverEnvironment*/ env) {
    const {
        payload
    } = env.getArguments();

    try {
        const questionSet = QuestionSetService.saveQuestionSet(payload);
        return questionSet;
    } catch (e) {
        return e;
    }

})(env);
