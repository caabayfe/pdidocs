(function calc(convGr) {
    if (!convGr.isValid())
        return;
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
    if (!assessmentInstanceGr.next())
        return;

    var output = {};
    var metricResultGr = new GlideRecord('asmt_metric_result');
    metricResultGr.addQuery('assessment_group', assessmentInstanceGr.assessment_group);
    metricResultGr.addQuery('metric.name', 'Experience');
    metricResultGr.query();
    if(metricResultGr.next()){
        output['Feedback Result'] = metricResultGr.getValue('string_value');
        output['Feedback Result Id'] = metricResultGr.getValue('metric_definition');
    }
    return output;
})(convGr);
