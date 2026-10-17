(function(context, pageParams) {
    var ctaItems = [];
    var _result = new VaAdminConsoleMetrics().getLeastUsedTopics();
    var link = '/$conversation-builder.do#/topic/{topicId}/segment';
    var util = new sn_oe_sfs.CIUtil();
    ctaItems = _result.map(function(topic) {
        var topicId = util.getTopicId(topic.title);
        return {
            title: '<b style="font-weight:600">' + topic.title + '</b>',
            link: link.replace('{topicId}', topicId)
        };
    });
    context.props_details.details_block = ctaItems;
    context.props_details.key = 'FIX_IDLE_TOPICS';
})(context, pageParams);
