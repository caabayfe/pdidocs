function transform(input) {
    var canContributeToTemplates = GlidePluginManager.isActive('com.snc.knowledge_advanced') && new global.ArticleTemplateUtil().canContributeToTemplates();

    var knowledgeSubmissionPropEnabled = gs.getProperty('glide.knowman.submission.workflow', "false");

    var isActiveKcsIncidentKnowledgePlugin = GlidePluginManager.isActive('com.snc.incident.knowledge');

    var shouldUseSubmissionFlow = input.source == "incident" && (knowledgeSubmissionPropEnabled === "true") && !isActiveKcsIncidentKnowledgePlugin;

    var shouldUseItsmKcsFlow = input.source == "incident" && isActiveKcsIncidentKnowledgePlugin;

    var tableAndQueryFromSourceParam = new global.KBAjax().generateQueryAndTableNameFromSorceParam(input);

    let gapSourceSysId = '';
    if (!gs.nil(input.gapsSysIds)) {
        let gapIds = input.gapsSysIds.split(',').filter(function(id) {
            return id.trim() !== '';
        });
        if (gapIds.length === 1) {
            let gapGr = new GlideRecordSecure('kb_gap_candidates');
            gapGr.addQuery('sys_id', gapIds[0].trim());
            gapGr.query();
            if (gapGr.next()) {
                gapSourceSysId = gapGr.getValue('task') || '';
            }
        }
    }

    return {
        "canContributeToTemplates": canContributeToTemplates,
        "shouldUseSubmissionFlow": shouldUseSubmissionFlow,
        "shouldUseItsmKcsFlow": shouldUseItsmKcsFlow,
        "tableAndQuery": tableAndQueryFromSourceParam,
        "gapSourceSysId": gapSourceSysId
    };
}
