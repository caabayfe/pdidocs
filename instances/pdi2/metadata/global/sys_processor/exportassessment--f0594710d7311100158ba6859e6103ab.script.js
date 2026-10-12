var sysid = g_request.getParameter('sysparm_sys_id');
var exporter = new ExportWithRelatedLists('asmt_metric_type', sysid);
exporter.addRelatedList('asmt_metric_category', 'metric_type');
exporter.addRelatedList('asmt_assessable_record', 'metric_type');
exporter.addRelatedList('asmt_metric', 'category.metric_type');
exporter.addRelatedList('asmt_metric_definition', 'metric.category.metric_type');
exporter.addRelatedList('asmt_m2m_category_assessment', 'category.metric_type');
exporter.addRelatedList('asmt_m2m_category_user', 'metric_category.metric_type');
exporter.addRelatedList('asmt_m2m_stakeholder', 'assessment_record.metric_type');
exporter.addRelatedList('asmt_decision_matrix', 'metric_type');
exporter.addRelatedList('asmt_m2m_xcategory_matrix', 'metric_category.metric_type');
exporter.addRelatedList('asmt_m2m_ycategory_matrix', 'metric_category.metric_type');
exporter.addRelatedList('asmt_condition', 'assessment');

var templateIDs = '';
var tempdefIDs = '';
var metrics = new GlideRecord('asmt_metric');
metrics.addQuery('metric_type', sysid);
metrics.query();
while (metrics.next()) {
    if (metrics.getValue('template')) {
        if (templateIDs.length > 0)
            templateIDs += ',';
        var tempSysId = metrics.getValue('template');
        templateIDs += tempSysId;
        var tempDefGr = new GlideRecord('asmt_template_definition');
        tempDefGr.addQuery('template', tempSysId);
        tempDefGr.query();
        while (tempDefGr.next()) {
            if (tempdefIDs.length > 0)
                tempdefIDs += ',';
            tempdefIDs += tempDefGr.getValue('sys_id');
        }
    }
}
if (templateIDs.length > 0) {
    exporter.addQuerySet('asmt_template', 'sys_idIN' + templateIDs);
    exporter.addQuerySet('asmt_template_definition', 'sys_idIN' + tempdefIDs);
}
if (tempdefIDs.length > 0) {
    exporter.addQuerySet('sys_attachment', "table_sys_idIN" + tempdefIDs);
    exporter.addQuerySet('sys_attachment_doc', 'sys_attachment.table_sys_idIN' + tempdefIDs);
}

var metricType = new GlideRecord('asmt_metric_type');
metricType.get(sysid);
if (metricType.getValue('job')) {
    exporter.addQuerySet('sys_trigger', 'sys_id=' + metricType.getValue('job'));
}

var triggerCondition = new GlideRecord('asmt_condition');
triggerCondition.addQuery('assessment', sysid);
triggerCondition.query();
if (triggerCondition.next()) {
    exporter.addQuerySet('sys_script', 'sys_id=' + triggerCondition.getValue('business_rule'));
}

var definitionIDs = '';
var metricDefinition = new GlideRecord("asmt_metric_definition");
metricDefinition.addEncodedQuery("metric.datatype=imagescale^metric.category.metric_type=" + sysid);
metricDefinition.query();
while (metricDefinition.next()) {
    if (definitionIDs.length > 0)
        definitionIDs += ',';
    definitionIDs += metricDefinition.getValue('sys_id');
}
if (definitionIDs.length > 0) {
    exporter.addQuerySet('sys_attachment', "table_sys_idIN" + definitionIDs);
    exporter.addQuerySet('sys_attachment_doc', 'sys_attachment.table_sys_idIN' + definitionIDs);
}

exporter.exportRecords(g_response);
