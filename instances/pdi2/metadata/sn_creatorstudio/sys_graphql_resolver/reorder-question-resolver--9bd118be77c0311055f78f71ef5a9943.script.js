(function process( /*ResolverEnvironment*/ env) {
    const {
        payload
    } = env.getArguments();
    try {
        const sortedQuestions = QuestionService.reorderQuestions(payload);
        return sortedQuestions;
    } catch (e) {
        return e;
    }
})(env);
