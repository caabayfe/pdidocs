(function process( /*ResolverEnvironment*/ env) {
    var topicIds = env.getArguments().topicIds;
    var topicGr = new GlideRecord("topic");
    topicGr.addQuery("sys_id", topicIds);
    topicGr.query();
    var topicDetails = [];
    if (!gs.hasRole('catalog_builder_editor')) throw gs.getMessage("User does not have access");
    while (topicGr.next()) {
        topicDetails.push({
            value: topicGr.getUniqueValue(),
            displayValue: global.JSUtil.notNil(topicGr.getDisplayValue("topic_path")) ? topicGr.getDisplayValue("topic_path") :
                topicGr.getDisplayValue("name"),
            canRead: topicGr.canRead(),
            active: topicGr.getValue("active")
        });
    }
    return topicDetails;
})(env);
