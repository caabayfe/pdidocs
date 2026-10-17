(function process(env) {
    if (!env.getArguments()) {
        return null;
    }
    const {
        pageSize,
        offset,
        searchTerm
    } = env.getArguments();
    try {
        return RecordProducerService.getRecordProducerTemplates(pageSize, offset, searchTerm);
    } catch (e) {
        return e;
    }
})(env);
