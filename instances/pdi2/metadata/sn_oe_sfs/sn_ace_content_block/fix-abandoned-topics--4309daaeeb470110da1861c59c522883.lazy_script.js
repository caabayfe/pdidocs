(function(context, pageParams) {
    var ctaItems = [];
    var link = '/$conversation-builder.do#/topic/{topicId}/segment';
    var util = new sn_oe_sfs.CIUtil();
    var _result = new VaAdminConsoleMetrics().getNotCompletedTopics();
    ctaItems = _result.map(function(topic) {
        var abandonedCount = '<span style="color: #A54042;font-weight: 600" >' + topic.count + '</span>';
        var abandonedSubtitle = '<p style="margin: 0;color: #637274">' + gs.getMessage('Abandoned {0} times', abandonedCount) + '</p>';
		var topicId = util.getTopicId(topic.title);
        return {
            title: '<b style="font-weight:600">' + topic.title + '</b>',
            subtitle: abandonedSubtitle,
            link: link.replace('{topicId}', topicId)
        };
    });
    context.props_details.details_block = ctaItems;
	context.props_details.key = 'FIX_ABANDONED_TOPICS';
})(context, pageParams);
