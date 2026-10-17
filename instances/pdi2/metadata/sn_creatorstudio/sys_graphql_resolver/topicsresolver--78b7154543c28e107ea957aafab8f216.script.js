(function process(env) {
    if (!env.getArguments()) {
        return null;
    }
    const {
        taxonomy,
        parentTopic,
        offset,
        pageSize,
        searchTerm,
        topLevel
    } = env.getArguments();
    try {
        return RecordProducerService.getTopics(taxonomy, parentTopic, offset, pageSize, searchTerm, topLevel);
    } catch (e) {
        return e;
    }
})(env);
