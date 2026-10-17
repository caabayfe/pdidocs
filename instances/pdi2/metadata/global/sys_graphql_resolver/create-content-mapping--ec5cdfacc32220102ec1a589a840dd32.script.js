(function process( /*ResolverEnvironment*/ env) {
    var contentSysId = env.getArguments().contentId;
    var contentTable = env.getArguments().contentTable;
    var topicSysId = env.getArguments().topicId;
    var connectedContentId = new global.TaxonomyUtil().associateContentToTopic(contentSysId, contentTable, topicSysId);
    return connectedContentId ? {
        id: connectedContentId
    } : {
        id: null
    };
})(env);
