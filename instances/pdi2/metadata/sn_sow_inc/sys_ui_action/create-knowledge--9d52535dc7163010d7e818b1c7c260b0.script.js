var issueLabel;
var resolutionLabel;
if (isNowAssistEnabled()) {
    try {
        targetURL = new sn_itsm_gen_ai.NowAssistItsmGenAIUtils().getNewKnowledgeArticleLink(current);
    } catch (error) {
        targetURL = "/kb_knowledge.do?sys_id=-1";
        gs.error("Could not get target URL for the Knowledge Article: " + error);
    }
    action.setReturnURL(current);
    action.setRedirectURL(targetURL);
} else if (GlidePluginManager.isActive('com.snc.incident.knowledge')) {
    var targetURL;
    try {
        targetURL = new SOWIncidentKnowledgeUtils().getNewKnowledgeArticleLink(current);
    } catch (error) {
        targetURL = "/kb_knowledge.do?sys_id=-1";
        gs.error("Error occurred while fetching targetURL: " + error);
    }
    action.setReturnURL(current);
    action.setRedirectURL(targetURL);
} else {
    var sub = gs.getProperty('glide.knowman.submission.workflow');
    issueLabel = gs.getMessage("Issue");
    resolutionLabel = gs.getMessage("Resolution");
    if (sub == 'true')
        submitCandidate();
    else
        submitDirect();
}

function submitDirect() {
    var kb = new GlideRecord("kb_knowledge");
    kb.source = current.sys_id;
    kb.short_description = current.short_description;
    kb.sys_domain = current.sys_domain;
    kb.text = "<p><strong>" + issueLabel + "</strong> - " + current.description + "</p> <p><strong>" + resolutionLabel + "</strong> - " + current.close_notes + "</p>";
    kb.workflow_state = 'draft';
    kb.kb_knowledge_base = gs.getProperty("glide.knowman.task_kb", "dfc19531bf2021003f07e2c1ac0739ab");
    kb.insert();
}

function submitCandidate() {
    var gr = new GlideRecord('kb_submission');
    gr.parent = current.sys_id;
    gr.short_description = current.short_description;
    gr.sys_domain = current.sys_domain;
    gr.text = "<p><strong>" + issueLabel + "</strong> - " + current.description + "</p> <p><strong>" + resolutionLabel + "</strong> - " + current.close_notes + "</p>";
    if (gr.insert())
        gs.addInfoMessage(gs.getMessage('KB submission {0} was created and attached to the parent record {1}', [gr.getDisplayValue(), current.getDisplayValue()]));
}

function isNowAssistEnabled() {
    try {
        return new sn_itsm_gen_ai.NowAssistItsmGenAIUtils().showSowCreateKnowledgeUiAction(current, 'incident');
    } catch (e) {
        gs.error("Error while checking skilll: " + e);
    }
    return false;
}
