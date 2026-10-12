(function(context, pageParams, blockcontext) {
    var modelId = blockcontext.modelToDeleteSysId;
    var mappedIntents = new global.NLUInterfaceHelper().getMappedIntents(modelId, '');
    var intentsMappedToVA = mappedIntents && mappedIntents[0].mappings;
    var intentTopicsMapping = Object.keys(intentsMappedToVA).map(function(key) {
        return intentsMappedToVA[key];
    });
    var topicLinks = [];
    intentTopicsMapping.forEach(function(topic) {
        topic.forEach(function(item) {
            topicLinks.push({
                "topicName": item.name,
                "topicLink": item.link
            });
        });
    });
	return topicLinks;
})(context, pageParams, blockcontext);
