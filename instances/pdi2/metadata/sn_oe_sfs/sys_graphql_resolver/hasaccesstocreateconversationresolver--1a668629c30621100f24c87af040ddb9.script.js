(function process(/*ResolverEnvironment*/ env) {
        var documentTable = env.getArguments()['documentTable'];
        var documentId = env.getArguments()['documentId'];
        let hasAccess = new SidebarAccessCheckUtils().hasAccessToCreateSidebar(documentTable, documentId);
        return {
            result: hasAccess
        };
})(env);
