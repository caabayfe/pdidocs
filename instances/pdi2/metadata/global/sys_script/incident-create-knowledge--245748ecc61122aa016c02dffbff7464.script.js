var sub = gs.getProperty('glide.knowman.submission.workflow');

if (sub == 'true')
    submitCandidate();
else
    submitDirect();

function submitDirect() {
    var kb = new GlideRecord("kb_knowledge");
    kb.source = current.sys_id;
    kb.short_description = current.short_description;
    kb.sys_domain = current.sys_domain;
    kb.text = current.comments.getHTMLValue();
    kb.workflow_state = 'draft';
    kb.kb_knowledge_base = gs.getProperty("glide.knowman.task_kb", "dfc19531bf2021003f07e2c1ac0739ab");
    kbSysId = kb.insert();
    if (kbSysId)
        gs.addInfoMessage(gs.getMessage('Knowledge Article created: {0} based on closure of Incident: {1}', [kb.number, current.number]));
}

function submitCandidate() {
    var gr = new GlideRecord('kb_submission');
    gr.parent = current.sys_id;
    gr.short_description = current.short_description;
    gr.sys_domain = current.sys_domain;
    gr.text = current.comments.getHTMLValue();
    gr.insert();
    gs.addInfoMessage(gs.getMessage('Knowledge Submission created: {0} based on closure of Incident: {1}', [gr.number, current.number]));

}
