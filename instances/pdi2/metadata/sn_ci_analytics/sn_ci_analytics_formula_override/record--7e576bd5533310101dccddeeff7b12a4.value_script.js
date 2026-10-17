(function calc(convGr) {

    var interactionGr = new GlideRecord('interaction');
    interactionGr.addQuery('channel_metadata_document', convGr.sys_id);
    interactionGr.addQuery('channel_metadata_table', 'sys_cs_conversation');
    interactionGr.query();
    if (!interactionGr.next())
        return;

    var assessmentInstanceGr = new GlideRecord('asmt_assessment_instance');
    assessmentInstanceGr.addQuery('metric_type.evaluation_method', 'survey');
    assessmentInstanceGr.addQuery('state', 'complete');
    assessmentInstanceGr.addQuery('trigger_id', interactionGr.sys_id);
    assessmentInstanceGr.query();
    assessmentInstanceGr.next();

    var metricResultGr = new GlideRecord('asmt_metric_result');
    metricResultGr.addQuery('assessment_group', assessmentInstanceGr.assessment_group);
    metricResultGr.addQuery('metric.name', 'Experience');
    metricResultGr.query();
    metricResultGr.next();

    var positiveFeedback = metricResultGr.getValue('string_value') != 'Bad';

    var liveAgentTransferFlag = convGr.getValue('live_agent_transfer_time') != '';

    var reason = interactionGr.getValue('state_reason');
    var completeConvFlag = interactionGr.getValue('state') == 'closed_complete' && (reason == 'topic_complete' || reason == 'user_ended' || reason == 'auto_closed');

    return positiveFeedback && !liveAgentTransferFlag && completeConvFlag;

})(convGr);
