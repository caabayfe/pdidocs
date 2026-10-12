(function(context, pageParams) {
    var ctaItems = [];
    var link = '/$conversation-builder.do#/topic/{topicId}/segment';
	var util = new sn_oe_sfs.CIUtil();
    var _result = new VaAdminConsoleMetrics().getUnderPerformedTopics();
    ctaItems = _result.map(function(topic) {
        var escalatedCount = '<span style="color: #A54042;font-weight: 600" >' + topic.count + '</span>';
        var escalatedSubtitle = '<p style="margin: 0;color: #637274">' + gs.getMessage('Escalated {0} times', escalatedCount) + '</p>';
        var topicId = util.getTopicId(topic.title);
        return {
            title: '<b style="font-weight:600">' + topic.title + '</b>',
            subtitle: escalatedSubtitle,
            link: link.replace('{topicId}', topicId)
        };
    });
    context.props_details.details_block = ctaItems;
	context.props_details.key = 'FIX_UNDERPERFORMING_TOPICS';
})(context, pageParams);
