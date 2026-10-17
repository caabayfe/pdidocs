(function process( /*ResolverEnvironment*/ env) {
    const {
        payload
    } = env.getArguments();

    try {
        const question = QuestionService.saveQuestion(payload);
        return question;
    } catch (e) {
        return e;
    }

})(env);
