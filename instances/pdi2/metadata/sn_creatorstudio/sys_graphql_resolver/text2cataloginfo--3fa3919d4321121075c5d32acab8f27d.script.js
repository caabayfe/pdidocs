(function process(/*ResolverEnvironment*/ env) {
    try {
        return new CreatorStudioGenAI().getText2CatalogInfo();
    } catch (e) {
        return e;
    }

})(env);
